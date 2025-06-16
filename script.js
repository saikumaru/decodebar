// Wait for the entire page to load before running the script
window.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed. Initializing script.');
  
    const barcodeInput = document.getElementById('barcode-input');
    const outputDiv = document.getElementById('output');
  
    // Initialize the barcode reader
    // This line will now work because ZXing is guaranteed to be loaded.
    const codeReader = new ZXing.BrowserMultiFormatReader();
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
          outputDiv.innerText = `Image loaded. Scanning for barcodes...`;
          
          try {
            codeReader.decodeFromImageUrl(img.src)
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
