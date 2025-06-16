// Wait for the entire page to load before running the script
window.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded and parsed. Initializing script.');

  const barcodeInput = document.getElementById('barcode-input');
  const outputDiv = document.getElementById('output');

  // Initialize the barcode reader with a hint to try harder
  const hints = new Map();
  hints.set(ZXing.DecodeHintType.TRY_HARDER, true);
  const codeReader = new ZXing.BrowserMultiFormatReader(hints);
  console.log('ZXing code reader initialized');

  barcodeInput.addEventListener('change', (event) => {
    outputDiv.innerText = 'Starting barcode detection...';
    console.log('File input changed. A file was selected.');

    const file = event.target.files[0];
    if (!file) {
      console.error('No file selected.');
      outputDiv.innerText = 'Error: No file selected.';
      return;
    }

    console.log(`File selected: ${file.name}`);

    const reader = new FileReader();
    reader.onload = function(e) {
      const img = new Image();
      img.onload = function() {
        console.log(`Image loaded. Dimensions: ${img.width}x${img.height}`);
        outputDiv.innerText = `Image loaded. Pre-processing to B&W...`;

        // --- MINIMAL CHANGE STARTS HERE ---

        // 1. Create a temporary canvas to draw the image for processing.
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const context = canvas.getContext('2d');
        context.drawImage(img, 0, 0, img.width, img.height);

        // 2. Get pixel data and apply the black & white filter.
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          const finalColor = avg < 128 ? 0 : 255; // Simple threshold
          data[i] = finalColor;
          data[i + 1] = finalColor;
          data[i + 2] = finalColor;
        }
        context.putImageData(imageData, 0, 0);

        // 3. Get the processed image as a new URL.
        const processedImageUrl = canvas.toDataURL();

        // --- MINIMAL CHANGE ENDS HERE ---
        
        outputDiv.innerText = `Image processed. Scanning for barcodes...`;

        try {
          // 4. Use the *new* processed image URL with the original function call.
          codeReader.decodeFromImageUrl(processedImageUrl)
            .then(result => {
              console.log('Barcode FOUND!');
              console.log('Decoded Text:', result.getText());
              console.log('Barcode Format:', result.getBarcodeFormat());
              console.log('Full Result Object:', result);

              const formatName = ZXing.BarcodeFormat[result.getBarcodeFormat()];
              outputDiv.innerHTML = `
                Success! Found a <span class="format">${formatName}</span> barcode.
                <br><br>
                Decoded Text:
                <br>
                ${result.getText()}
              `;
            })
            .catch(err => {
              console.error('Barcode detection failed:', err);
              if (err instanceof ZXing.NotFoundException) {
                outputDiv.innerText = 'Scan complete. No barcode was found in the image.';
              } else {
                outputDiv.innerText = `An error occurred during scanning: ${err}`;
              }
            });
        } catch (error) {
          console.error('An unexpected error occurred during the decoding process.', error);
          outputDiv.innerText = 'An unexpected error occurred. Check the console for details.';
        }
      };
      
      img.onerror = () => {
          console.error('Image Error: The image could not be loaded.');
          outputDiv.innerText = 'Error: The selected file could not be loaded as an image.';
      };

      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
  });
});
