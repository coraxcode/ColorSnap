document.addEventListener('DOMContentLoaded', () => {
    const hexInput = document.getElementById('hexInput');
    const addColorBtn = document.getElementById('addColorBtn');
    const palette = document.getElementById('palette');
    const exportBtn = document.getElementById('exportBtn');
    const imageInput = document.getElementById('imageInput');
    const imageCanvas = document.getElementById('imageCanvas');
    const colorPickerBtn = document.getElementById('color-picker-btn');

    // Initialize Pickr color picker
    let pickr = Pickr.create({
        el: '#color-picker-btn',
        theme: 'classic',
        default: '#ff0000',
        components: {
            preview: true,
            opacity: true,
            hue: true,
            interaction: {
                hex: true,
                rgba: true,
                hsva: true,
                input: true,
                clear: true,
                save: true
            }
        }
    });

    // Sync Pickr with the hex input field
    pickr.on('change', (color) => {
        const hexColor = color.toHEXA().toString();
        hexInput.value = hexColor;
        colorPickerBtn.style.backgroundColor = hexColor;
    });

    // Update Pickr color when typing into the hex input field
    hexInput.addEventListener('input', () => {
        let hex = hexInput.value.startsWith('#') ? hexInput.value : `#${hexInput.value}`;
        if (isValidHex(hex)) {
            pickr.setColor(hex);
            colorPickerBtn.style.backgroundColor = hex;
        }
    });

    // Add selected color to the palette
    addColorBtn.addEventListener('click', () => {
        const colorValue = hexInput.value;
        if (isValidHex(colorValue)) {
            addColorToPalette(colorValue);
        } else {
            alert('Please enter a valid hex code.');
        }
    });

    // Export the palette as a PNG
    exportBtn.addEventListener('click', () => {
        // Temporarily hide delete buttons during export
        document.querySelectorAll('.delete-btn').forEach(btn => btn.classList.add('hidden'));
        html2canvas(palette).then(canvas => {
            const link = document.createElement('a');
            link.download = 'palette.png';
            link.href = canvas.toDataURL();
            link.click();
            // Show delete buttons again after export
            document.querySelectorAll('.delete-btn').forEach(btn => btn.classList.remove('hidden'));
        });
    });

    // Handle image upload and display
    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && isValidImageType(file.type)) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const img = new Image();
                img.onload = function() {
                    const ratio = img.width / img.height;
                    imageCanvas.width = 500; 
                    imageCanvas.height = imageCanvas.width / ratio;
                    const ctx = imageCanvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, imageCanvas.width, imageCanvas.height);
                }
                img.src = event.target.result;
            }
            reader.readAsDataURL(file);
        } else {
            alert('Unsupported image format.');
        }
    });

    // Pick a color from the uploaded image
    imageCanvas.addEventListener('click', (e) => {
        const rect = imageCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const ctx = imageCanvas.getContext('2d');
        const pixelData = ctx.getImageData(x, y, 1, 1).data;
        const hexColor = rgbaToHex(pixelData[0], pixelData[1], pixelData[2], pixelData[3]);
        hexInput.value = hexColor;
        pickr.setColor(hexColor);
        colorPickerBtn.style.backgroundColor = hexColor;
    });

    // Helper Functions
    function isValidHex(hex) {
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/.test(hex);
    }

    function isValidImageType(type) {
        return ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/bmp'].includes(type);
    }

    function addColorToPalette(color) {
        const swatch = document.createElement('div');
        swatch.classList.add('color-swatch');
        swatch.style.backgroundColor = color;

        const colorCode = document.createElement('span');
        colorCode.textContent = color;
        swatch.appendChild(colorCode);

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'X';
        deleteBtn.className = 'delete-btn';
        deleteBtn.onclick = () => palette.removeChild(swatch);
        swatch.appendChild(deleteBtn);

        palette.appendChild(swatch);
    }

    function rgbaToHex(r, g, b, a) {
        const alpha = a !== undefined ? a : 255;
        const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
        const alphaHex = alpha !== 255 ? alpha.toString(16).padStart(2, '0') : '';
        return hex + alphaHex;
    }
});
