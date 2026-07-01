const display = document.getElementById('display');
const labelElement = document.getElementById('label');
const addressDisplay = document.getElementById('address-display');
const errorConsole = document.getElementById('error-console');
const helpScreen = document.getElementById('help-screen');
const timerContainer = document.getElementById('timer-container');

// Form configuration builder elements
const inputDate = document.getElementById('input-date');
const inputTime = document.getElementById('input-time');
const inputLabel = document.getElementById('input-label');
const inputColor = document.getElementById('input-color');
const inputBgColor = document.getElementById('input-bgcolor');
const inputMsDigit = document.getElementById('input-msdigit');
const msDigitValue = document.getElementById('msdigit-value');
const inputUnit = document.getElementById('input-unit');
const inputClip = document.getElementById('input-clip');
const clipValue = document.getElementById('clip-value');
const inputAutoShrink = document.getElementById('input-autoshrink');
const autoShrinkValue = document.getElementById('autoshrink-value');
const inputMouseHide = document.getElementById('input-mousehide');
const mouseHideValue = document.getElementById('mousehide-value');
const btnLaunch = document.getElementById('btn-launch');

const boxDate = document.getElementById('box-date');
const boxTime = document.getElementById('box-time');
const boxLabel = document.getElementById('box-label');
const boxColor = document.getElementById('box-color');
const boxBgColor = document.getElementById('box-bgcolor');
const boxMsDigit = document.getElementById('box-msdigit');
const boxUnit = document.getElementById('box-unit');
const boxClip = document.getElementById('box-clip');
const boxAutoShrink = document.getElementById('box-autoshrink');
const boxMouseHide = document.getElementById('box-mousehide');

// Preview error elements
const previewErrorConsole = document.getElementById('preview-error-console');

// Font upload elements
const fontUpload = document.getElementById('font-upload');
const btnUploadFont = document.getElementById('btn-upload-font');
const fontStatus = document.getElementById('font-status');

let customFontLoaded = false;
let msDigits = 0; 
let displayUnit = '';       
let decimalClip = 0;        
let autoShrinkEnabled = false;
let mouseHideEnabled = false;
let mouseHideTimeout = null;

// ----------------------------------------------------------------
// ERROR CONSOLE ENGINE
// ----------------------------------------------------------------
function showErrors(errors, targetElement, errorConsoleElement) {
    if (!errors || errors.length === 0) {
        if (errorConsoleElement) {
            errorConsoleElement.style.display = 'none';
            errorConsoleElement.innerHTML = '';
        }
        if (targetElement) targetElement.style.color = document.body.style.color || '#39FF14';
        return;
    }

    const count = errors.length;
    const header = count === 1 
        ? '1 ERROR WAS FOUND' 
        : `${count} ERRORS WERE FOUND`;
    
    let listHTML = `<div style="font-weight: bold; font-size: inherit;">${header}</div><ul style="list-style-type: decimal; padding-left: 1.5rem; margin: 0.5rem 0 0 0; text-align: left;">`;
    errors.forEach((err, index) => {
        listHTML += `<li style="margin: 0.25rem 0;">${err}</li>`;
    });
    listHTML += `</ul>`;

    if (errorConsoleElement) {
        errorConsoleElement.innerHTML = listHTML;
        errorConsoleElement.style.display = 'block';
        
        const totalChars = listHTML.replace(/<[^>]*>/g, '').length;
        let fontSize = '1.2rem';
        if (totalChars > 150) fontSize = '0.9rem';
        else if (totalChars > 80) fontSize = '1rem';
        errorConsoleElement.style.fontSize = fontSize;
    }

    if (targetElement) {
        targetElement.style.color = document.body.style.color || '#39FF14';
    }
}

// ----------------------------------------------------------------
// MOUSE HIDE LOGIC
// ----------------------------------------------------------------
function setupMouseHide() {
    if (!mouseHideEnabled) {
        document.body.style.cursor = 'default';
        return;
    }

    let hideTimer = null;

    function resetHideTimer() {
        document.body.style.cursor = 'default';
        clearTimeout(hideTimer);
        hideTimer = setTimeout(() => {
            document.body.style.cursor = 'none';
        }, 500); // 0.5 seconds
    }

    // Reset timer on any mouse movement
    document.addEventListener('mousemove', resetHideTimer);
    document.addEventListener('mousedown', resetHideTimer);
    document.addEventListener('mouseup', resetHideTimer);

    // Initialize the timer
    resetHideTimer();
}

// ----------------------------------------------------------------
// CUSTOM FONT PERSISTENCE
// ----------------------------------------------------------------
function loadCustomFontFromStorage() {
    const storedFontName = localStorage.getItem('customTimerFontName');
    const storedFontData = localStorage.getItem('customTimerFontData');
    
    if (storedFontName && storedFontData) {
        try {
            const binaryString = atob(storedFontData);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            
            const fontFace = new FontFace(storedFontName, bytes.buffer);
            fontFace.load().then(function(loadedFace) {
                document.fonts.add(loadedFace);
                applyFontToAllElements(storedFontName);
                customFontLoaded = true;
                if (fontStatus) {
                    fontStatus.textContent = `✓ Loaded from storage: ${storedFontName}`;
                    fontStatus.style.color = '#39FF14';
                }
            }).catch(function(err) {
                console.error('Failed to restore font from storage:', err);
                localStorage.removeItem('customTimerFontName');
                localStorage.removeItem('customTimerFontData');
            });
        } catch (e) {
            console.error('Error parsing stored font:', e);
            localStorage.removeItem('customTimerFontName');
            localStorage.removeItem('customTimerFontData');
        }
    }
}

function applyFontToAllElements(fontName) {
    display.style.fontFamily = `'${fontName}', sans-serif`;
    labelElement.style.fontFamily = `'${fontName}', sans-serif`;
    errorConsole.style.fontFamily = `'${fontName}', sans-serif`;
    
    const previewDisplay = document.getElementById('preview-display');
    const previewLabel = document.getElementById('preview-label');
    const previewError = document.getElementById('preview-error-console');
    
    if (previewDisplay) previewDisplay.style.fontFamily = `'${fontName}', sans-serif`;
    if (previewLabel) previewLabel.style.fontFamily = `'${fontName}', sans-serif`;
    if (previewError) previewError.style.fontFamily = `'${fontName}', sans-serif`;
}

function setupFontUpload() {
    if (!btnUploadFont || !fontUpload) return;

    btnUploadFont.addEventListener('click', () => {
        fontUpload.click();
    });

    fontUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            const fontData = event.target.result;
            const fontName = file.name.replace(/\.[^/.]+$/, "");
            
            const fontFace = new FontFace(fontName, fontData);
            fontFace.load().then(function(loadedFace) {
                document.fonts.add(loadedFace);
                applyFontToAllElements(fontName);
                customFontLoaded = true;
                fontStatus.textContent = `✓ Loaded: ${file.name}`;
                fontStatus.style.color = '#39FF14';
                
                try {
                    const bytes = new Uint8Array(fontData);
                    let binary = '';
                    for (let i = 0; i < bytes.byteLength; i++) {
                        binary += String.fromCharCode(bytes[i]);
                    }
                    const base64 = btoa(binary);
                    
                    localStorage.setItem('customTimerFontName', fontName);
                    localStorage.setItem('customTimerFontData', base64);
                } catch (err) {
                    console.warn('Could not save font to localStorage:', err);
                }
                
            }).catch(function(err) {
                console.error('Font loading failed:', err);
                fontStatus.textContent = '✗ Failed to load font';
                fontStatus.style.color = '#ff0000';
            });
        };
        reader.readAsArrayBuffer(file);
    });
}

// ----------------------------------------------------------------
// END FONT PERSISTENCE
// ----------------------------------------------------------------

function applyColorOverride() {
    const params = new URLSearchParams(window.location.search);
    let colorChoice = params.get('color');

    if (colorChoice) {
        colorChoice = colorChoice.trim();
        if (/^[0-9A-Fa-f]{6}$/.test(colorChoice)) {
            document.body.style.color = `#${colorChoice}`;
        } else {
            document.body.style.color = colorChoice;
        }
    }
}

function applyBgColorOverride() {
    const params = new URLSearchParams(window.location.search);
    let bgChoice = params.get('bg');

    if (bgChoice) {
        bgChoice = bgChoice.trim();
        if (/^[0-9A-Fa-f]{6}$/.test(bgChoice)) {
            document.body.style.backgroundColor = `#${bgChoice}`;
        } else if (/^[0-9A-Fa-f]{3}$/.test(bgChoice)) {
            const expanded = bgChoice.split('').map(c => c + c).join('');
            document.body.style.backgroundColor = `#${expanded}`;
        } else {
            document.body.style.backgroundColor = bgChoice;
        }
    }
}

function setupFormBuilder() {
    if (!btnLaunch) return;

    inputMsDigit.addEventListener('input', () => {
        msDigitValue.textContent = inputMsDigit.value;
    });

    inputClip.addEventListener('input', () => {
        clipValue.textContent = inputClip.value;
    });

    inputAutoShrink.addEventListener('input', () => {
        autoShrinkValue.textContent = inputAutoShrink.value === '1' ? 'ON' : 'OFF';
    });

    inputMouseHide.addEventListener('input', () => {
        mouseHideValue.textContent = inputMouseHide.value === '1' ? 'ON' : 'OFF';
    });

    btnLaunch.addEventListener('click', () => {
        boxDate.classList.remove('error-border');
        boxTime.classList.remove('error-border');
        boxLabel.classList.remove('error-border');
        boxColor.classList.remove('error-border');
        boxBgColor.classList.remove('error-border');
        boxMsDigit.classList.remove('error-border');
        boxUnit.classList.remove('error-border');
        boxClip.classList.remove('error-border');
        boxAutoShrink.classList.remove('error-border');
        boxMouseHide.classList.remove('error-border');

        let hasError = false;
        
        const dateVal = inputDate.value.trim();
        const timeVal = inputTime.value.trim();
        const labelVal = inputLabel.value.trim();
        const colorVal = inputColor.value.replace('#', '').toLowerCase();
        const bgVal = inputBgColor.value.replace('#', '').toLowerCase();
        const msDigitVal = parseInt(inputMsDigit.value, 10);
        const unitVal = inputUnit.value.trim();
        const clipVal = parseInt(inputClip.value, 10);
        const autoShrinkVal = parseInt(inputAutoShrink.value, 10);
        const mouseHideVal = parseInt(inputMouseHide.value, 10);

        if (!dateVal && !timeVal) {
            boxDate.classList.add('error-border');
            boxTime.classList.add('error-border');
            hasError = true;
        }

        if (labelVal && /[^a-zA-Z0-9\s-_]/.test(labelVal)) {
            boxLabel.classList.add('error-border');
            hasError = true;
        }

        if (isNaN(msDigitVal) || msDigitVal < 0 || msDigitVal > 4) {
            boxMsDigit.classList.add('error-border');
            hasError = true;
        }

        const validUnits = ['ms', 'seconds', 'minutes', 'hours', 'days', 'weeks', 'months', 'years'];
        if (unitVal && !validUnits.includes(unitVal)) {
            boxUnit.classList.add('error-border');
            hasError = true;
        }

        if (isNaN(clipVal) || clipVal < 0) {
            boxClip.classList.add('error-border');
            hasError = true;
        }

        if (isNaN(autoShrinkVal) || (autoShrinkVal !== 0 && autoShrinkVal !== 1)) {
            boxAutoShrink.classList.add('error-border');
            hasError = true;
        }

        if (isNaN(mouseHideVal) || (mouseHideVal !== 0 && mouseHideVal !== 1)) {
            boxMouseHide.classList.add('error-border');
            hasError = true;
        }

        if (hasError) return;

        const querySegments = [];

        if (dateVal) querySegments.push(dateVal);
        if (timeVal) querySegments.push(timeVal);
        if (labelVal) querySegments.push(`label=${encodeURIComponent(labelVal)}`);
        
        if (colorVal !== '39ff14') {
            querySegments.push(`color=${colorVal}`);
        }
        
        if (bgVal !== '1a1a1a') {
            querySegments.push(`bg=${bgVal}`);
        }

        const currentParams = new URLSearchParams(window.location.search);
        const currentFont = currentParams.get('font');
        if (currentFont) {
            querySegments.push(`font=${currentFont}`);
        }

        querySegments.push(`ms-digit=${msDigitVal}`);
        
        if (unitVal) {
            querySegments.push(`unit=${unitVal}`);
        }
        
        if (clipVal > 0) {
            querySegments.push(`clip=${clipVal}`);
        }

        if (autoShrinkVal === 1) {
            querySegments.push(`autoshrink=true`);
        }

        if (mouseHideVal === 1) {
            querySegments.push(`mouse-hide=true`);
        }

        const targetUrl = `index.html?${querySegments.join('&')}`;
        window.location.href = targetUrl;
    });
}

function setupLivePreview() {
    const previewDisplay = document.getElementById('preview-display');
    const previewLabel = document.getElementById('preview-label');
    const previewContainer = document.getElementById('preview-container');
    
    if (!previewDisplay || !previewLabel || !previewContainer) return;

    function calculatePreviewTime() {
        const dateVal = inputDate.value.trim();
        const timeVal = inputTime.value.trim();
        const labelVal = inputLabel.value.trim();
        const colorVal = inputColor.value;
        const bgVal = inputBgColor.value;
        const msDigitVal = parseInt(inputMsDigit.value, 10);
        const unitVal = inputUnit.value.trim();
        const clipVal = parseInt(inputClip.value, 10);
        const autoShrinkVal = parseInt(inputAutoShrink.value, 10);
        const mouseHideVal = parseInt(inputMouseHide.value, 10);

        const errors = [];

        if (isNaN(msDigitVal) || msDigitVal < 0 || msDigitVal > 4) {
            errors.push(`ms-digit must be 0-4 (received: ${inputMsDigit.value})`);
        }

        const validUnits = ['ms', 'seconds', 'minutes', 'hours', 'days', 'weeks', 'months', 'years'];
        if (unitVal && !validUnits.includes(unitVal)) {
            errors.push(`Invalid unit "${unitVal}"`);
        }

        if (isNaN(clipVal) || clipVal < 0) {
            errors.push(`clip must be 0 or greater (received: ${inputClip.value})`);
        }

        if (isNaN(autoShrinkVal) || (autoShrinkVal !== 0 && autoShrinkVal !== 1)) {
            errors.push(`autoshrink must be ON or OFF`);
        }

        if (isNaN(mouseHideVal) || (mouseHideVal !== 0 && mouseHideVal !== 1)) {
            errors.push(`mouse-hide must be ON or OFF`);
        }

        if (errors.length > 0) {
            showErrors(errors, previewLabel, previewErrorConsole);
            previewDisplay.innerText = "--:--:--";
            previewLabel.innerText = "INVALID CONFIG";
            previewLabel.style.color = "#ff0000";
            return;
        } else {
            previewErrorConsole.style.display = 'none';
            previewErrorConsole.innerHTML = '';
            previewLabel.style.color = colorVal;
        }

        previewContainer.style.backgroundColor = bgVal;
        previewLabel.innerText = labelVal || "PREVIEW";

        let targetDate = null;
        const now = new Date();

        if (dateVal && timeVal) {
            targetDate = new Date(`${dateVal}T${timeVal}:00`);
        } else if (timeVal) {
            targetDate = new Date();
            const [hours, mins] = timeVal.split(':').map(Number);
            targetDate.setHours(hours, mins, 0, 0);
            if (targetDate < now) {
                targetDate.setDate(targetDate.getDate() + 1);
            }
        } else if (dateVal) {
            targetDate = new Date(`${dateVal}T00:00:00`);
        }

        let displayText = "00:00:00";

        if (targetDate && !isNaN(targetDate.getTime())) {
            const distance = targetDate.getTime() - now.getTime();

            if (distance < 0) {
                displayText = "00:00:00";
            } else {
                if (unitVal) {
                    const unitMap = {
                        'ms': 1,
                        'seconds': 1000,
                        'minutes': 60000,
                        'hours': 3600000,
                        'days': 86400000,
                        'weeks': 604800000,
                        'months': 2629800000,
                        'years': 31557600000
                    };
                    
                    let value = distance / unitMap[unitVal];
                    
                    if (clipVal > 0) {
                        value = parseFloat(value.toFixed(clipVal));
                        displayText = value.toString();
                    } else {
                        displayText = value.toString();
                    }
                } else {
                    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                    const milliseconds = Math.floor((distance % 1000) / Math.pow(10, 3 - msDigitVal));

                    let timeParts = [hours, minutes, seconds];
                    if (days > 0) timeParts.unshift(days);

                    displayText = timeParts.map(v => v.toString().padStart(2, '0')).join(':');

                    if (msDigitVal > 0) {
                        const msString = milliseconds.toString().padStart(msDigitVal, '0');
                        displayText += `.${msString}`;
                    }
                }
            }
        }

        previewDisplay.innerText = displayText;
        previewDisplay.style.color = colorVal;
        
        if (autoShrinkVal === 1) {
            const charCount = displayText.length;
            let fontSize = 'clamp(3.5rem, 12vw, 6rem)';
            if (charCount > 12) fontSize = 'clamp(1.5rem, 6vw, 3rem)';
            else if (charCount > 8) fontSize = 'clamp(2.5rem, 9vw, 4.5rem)';
            previewDisplay.style.fontSize = fontSize;
        } else {
            previewDisplay.style.fontSize = 'clamp(3.5rem, 12vw, 6rem)';
        }
        
        if (customFontLoaded) {
            const fontName = localStorage.getItem('customTimerFontName');
            if (fontName) {
                previewDisplay.style.fontFamily = `'${fontName}', sans-serif`;
                previewLabel.style.fontFamily = `'${fontName}', sans-serif`;
                previewErrorConsole.style.fontFamily = `'${fontName}', sans-serif`;
            }
        }
    }

    let updateTimeout;
    function debouncedUpdate() {
        clearTimeout(updateTimeout);
        updateTimeout = setTimeout(calculatePreviewTime, 50);
    }

    inputDate.addEventListener('input', debouncedUpdate);
    inputTime.addEventListener('input', debouncedUpdate);
    inputLabel.addEventListener('input', debouncedUpdate);
    inputColor.addEventListener('input', debouncedUpdate);
    inputBgColor.addEventListener('input', debouncedUpdate);
    inputMsDigit.addEventListener('input', debouncedUpdate);
    inputUnit.addEventListener('input', debouncedUpdate);
    inputClip.addEventListener('input', debouncedUpdate);
    inputAutoShrink.addEventListener('input', debouncedUpdate);
    inputMouseHide.addEventListener('input', debouncedUpdate);

    calculatePreviewTime();
    setInterval(calculatePreviewTime, 1000);
}

function checkHelpAndModifiers() {
    const params = new URLSearchParams(window.location.search);
    
    if (params.get('help') === 'true') {
        timerContainer.style.display = 'none';
        helpScreen.style.display = 'block';
        document.title = "Timer - Documentation";

        const fontChoice = params.get('font');
        if (fontChoice === '1') {
            document.body.classList.add('font-digital');
        } else if (fontChoice === '2') {
            document.body.classList.add('font-helvetica');
        }

        setupFormBuilder();
        setupLivePreview();
        setupFontUpload();
        
        return true; 
    }
    return false; 
}

function parseTime() {
    const params = new URLSearchParams(window.location.search);
    const hash = decodeURIComponent(window.location.hash.substring(1)).trim();
    const fullParams = window.location.search + window.location.hash;

    const label = params.get('label') || "";
    labelElement.innerText = label;

    const errors = [];

    // 1. Validate ms-digit
    const msDigitParam = params.get('ms-digit');
    if (msDigitParam !== null) {
        if (!/^-?\d+$/.test(msDigitParam)) {
            errors.push(`ms-digit must be an integer (received: "${msDigitParam}")`);
        } else {
            const parsed = parseInt(msDigitParam, 10);
            if (parsed < 0 || parsed > 4) {
                errors.push(`ms-digit must be 0-4 (received: ${parsed})`);
            } else {
                msDigits = parsed;
            }
        }
    } else {
        msDigits = 0;
    }

    // 2. Validate unit
    const unitParam = params.get('unit');
    const validUnits = ['ms', 'seconds', 'minutes', 'hours', 'days', 'weeks', 'months', 'years'];
    if (unitParam !== null) {
        if (!validUnits.includes(unitParam)) {
            errors.push(`Invalid unit: "${unitParam}" (must be ms, seconds, minutes, hours, days, weeks, months, or years)`);
        } else {
            displayUnit = unitParam;
        }
    } else {
        displayUnit = '';
    }

    // 3. Validate clip
    const clipParam = params.get('clip');
    if (clipParam !== null) {
        if (!/^-?\d+$/.test(clipParam)) {
            errors.push(`clip must be a positive integer (received: "${clipParam}")`);
        } else {
            const parsed = parseInt(clipParam, 10);
            if (parsed < 0) {
                errors.push(`clip must be 0 or greater (received: ${parsed})`);
            } else {
                decimalClip = parsed;
            }
        }
    } else {
        decimalClip = 0;
    }

    // 4. Validate autoshrink
    const autoShrinkParam = params.get('autoshrink');
    if (autoShrinkParam !== null) {
        if (autoShrinkParam === 'true') {
            autoShrinkEnabled = true;
        } else if (autoShrinkParam === 'false') {
            autoShrinkEnabled = false;
        } else {
            errors.push(`autoshrink must be "true" or "false" (received: "${autoShrinkParam}")`);
        }
    } else {
        autoShrinkEnabled = false;
    }

    // 5. Validate mouse-hide
    const mouseHideParam = params.get('mouse-hide');
    if (mouseHideParam !== null) {
        if (mouseHideParam === 'true') {
            mouseHideEnabled = true;
        } else if (mouseHideParam === 'false') {
            mouseHideEnabled = false;
        } else {
            errors.push(`mouse-hide must be "true" or "false" (received: "${mouseHideParam}")`);
        }
    } else {
        mouseHideEnabled = false;
    }

    // 6. Validate BG color
    const bgParam = params.get('bg');
    if (bgParam !== null) {
        const bg = bgParam.trim();
        const isHex6 = /^[0-9A-Fa-f]{6}$/.test(bg);
        const isHex3 = /^[0-9A-Fa-f]{3}$/.test(bg);
        const isNamedColor = CSS.supports('color', bg);
        
        if (!isHex6 && !isHex3 && !isNamedColor) {
            errors.push(`Invalid background color: "${bg}" (must be valid hex or color name)`);
        } else {
            if (isHex6) {
                document.body.style.backgroundColor = `#${bg}`;
            } else if (isHex3) {
                const expanded = bg.split('').map(c => c + c).join('');
                document.body.style.backgroundColor = `#${expanded}`;
            } else {
                document.body.style.backgroundColor = bg;
            }
        }
    }

    // 7. Parse Date/Time and Shorthand
    let dateStr = "";
    let timeStr = "";
    
    const potentialInputs = [
        ...params.keys(), 
        ...params.values(), 
        ...hash.split('#')
    ];

    potentialInputs.forEach(val => {
        if (!val) return; 
        val = val.trim();
        
        // === ULTRA STRICT CALENDAR DATE VALIDATION ===
        if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
            const parts = val.split('-').map(Number);
            const year = parts[0];
            const month = parts[1];
            const day = parts[2];

            if (month < 1 || month > 12) {
                errors.push(`Invalid date: Month ${month} is out of range (must be 1-12)`);
                return;
            }

            let maxDays;
            if (month === 2) {
                const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
                maxDays = isLeapYear ? 29 : 28;
            } else if ([4, 6, 9, 11].includes(month)) {
                maxDays = 30;
            } else {
                maxDays = 31;
            }

            if (day < 1 || day > maxDays) {
                const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });
                errors.push(`Invalid date: ${monthName} ${day}, ${year} does not exist! ${monthName} only has ${maxDays} days.`);
            } else {
                dateStr = val;
            }
        } 
        // === Strict Time Validation ===
        else if (/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(val)) {
            const parts = val.split(':').map(Number);
            const hours = parts[0];
            const mins = parts[1];
            
            if (hours < 0 || hours > 23) {
                errors.push(`Invalid time: Hour ${hours} is out of range (must be 0-23)`);
            } else if (mins < 0 || mins > 59) {
                errors.push(`Invalid time: Minute ${mins} is out of range (must be 0-59)`);
            } else {
                timeStr = val;
            }
        } 
        // === Fallback for times that LOOK like time but are invalid ===
        else if (/^(\d{1,2}):(\d{2})$/.test(val)) {
            const parts = val.split(':').map(Number);
            const hours = parts[0];
            const mins = parts[1];
            
            if (hours > 23) {
                errors.push(`Invalid time: Hour ${hours} is out of range (must be 0-23)`);
            }
            if (mins > 59) {
                errors.push(`Invalid time: Minute ${mins} is out of range (must be 0-59)`);
            }
            if (hours <= 23 && mins <= 59) {
                timeStr = val;
            }
        }
    });

    let targetDate = null;

    if (dateStr && timeStr) {
        targetDate = new Date(`${dateStr.replace(/-/g, '/')} ${timeStr}:00`);
    } else if (timeStr) {
        targetDate = new Date();
        const [hours, mins] = timeStr.split(':').map(Number);
        targetDate.setHours(hours, mins, 0, 0);
        if (targetDate < new Date()) {
            targetDate.setDate(targetDate.getDate() + 1);
        }
    } else if (dateStr) {
        targetDate = new Date(dateStr.replace(/-/g, '/'));
    } else {
        const shorthandSource = [...params.keys(), ...params.values(), ...hash.split('#')].find(
            v => v && 
                 v !== label && 
                 v !== 'label' && 
                 v !== 'help' && 
                 v !== 'true' && 
                 v !== 'font' && 
                 v !== '1' && 
                 v !== '2' && 
                 v !== 'color' &&
                 v !== 'bg' &&
                 v !== 'ms-digit' &&
                 v !== 'unit' &&
                 v !== 'clip' &&
                 v !== 'autoshrink' &&
                 v !== 'mouse-hide' &&
                 !/^[0-9A-Fa-f]{6}$/.test(v) && 
                 v.trim() !== ""
        );
        
        if (shorthandSource && /(\d+)([smh])/g.test(shorthandSource)) {
            const shorthandRegex = /(\d+)([smh])/g;
            let matches = [...shorthandSource.toLowerCase().matchAll(shorthandRegex)];
            let totalMs = 0;
            const multipliers = { 's': 1000, 'm': 60000, 'h': 3600000 };
            matches.forEach(m => totalMs += parseInt(m[1]) * multipliers[m[2]]);
            targetDate = new Date(Date.now() + totalMs);
        } else if (shorthandSource && !isNaN(shorthandSource) && shorthandSource !== "") {
            targetDate = new Date(Date.now() + (parseInt(shorthandSource) * 60000));
        }
    }

    // 8. Final validation of the target date
    if (!targetDate || isNaN(targetDate.getTime())) {
        if (errors.length === 0 || !errors.some(e => e.includes('Invalid date') || e.includes('Invalid time'))) {
            errors.push(label ? `Invalid time configuration for label: "${label}"` : "Invalid URL configuration (no valid date/time found)");
        }
    }

    // 9. If any errors exist, stop and display them
    if (errors.length > 0) {
        display.innerText = "--:--:--";
        showErrors(errors, labelElement, errorConsole);
        if (fullParams) {
            addressDisplay.innerText = decodeURIComponent(fullParams);
            addressDisplay.style.display = "block";
        }
        return null;
    }

    errorConsole.style.display = 'none';
    errorConsole.innerHTML = '';
    labelElement.style.color = document.body.style.color || '#39FF14';
    addressDisplay.style.display = "none";
    return targetDate;
}

function startTimer(target) {
    if (!target) return;
    
    const unitMap = {
        'ms': 1,
        'seconds': 1000,
        'minutes': 60000,
        'hours': 3600000,
        'days': 86400000,
        'weeks': 604800000,
        'months': 2629800000,
        'years': 31557600000
    };

    // --- HIGH-PERFORMANCE WARNING MODAL ---
    if (msDigits === 4) {
        const modal = document.getElementById('performance-modal');
        const proceedBtn = document.getElementById('modal-proceed');
        const cancelBtn = document.getElementById('modal-cancel');
        const timerContainerLocal = document.getElementById('timer-container');

        if (window._ms4ModalActive) return; 
        window._ms4ModalActive = true;

        modal.style.display = 'flex';
        timerContainerLocal.style.opacity = '0.3';

        proceedBtn.onclick = function() {
            modal.style.display = 'none';
            timerContainerLocal.style.opacity = '1';
            window._ms4ModalActive = false;
            startTimerLoop(target);
        };

        cancelBtn.onclick = function() {
            modal.style.display = 'none';
            timerContainerLocal.style.opacity = '1';
            window._ms4ModalActive = false;
            msDigits = 3;
            startTimerLoop(target);
        };
        return;
    }

    startTimerLoop(target);

    function startTimerLoop(targetDate) {
        function updateTimer() {
            const now = new Date().getTime();
            const distance = targetDate.getTime() - now;

            if (distance < 0) {
                display.innerText = "00:00:00";
                document.title = "00:00:00";
                return;
            }

            let displayText = "";

            if (displayUnit) {
                let value = distance / unitMap[displayUnit];
                
                if (decimalClip > 0) {
                    value = parseFloat(value.toFixed(decimalClip));
                    displayText = value.toString();
                } else {
                    displayText = value.toString();
                }
            } else {
                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                const milliseconds = Math.floor((distance % 1000) / Math.pow(10, 3 - msDigits));

                let timeParts = [hours, minutes, seconds];
                if (days > 0) timeParts.unshift(days);

                displayText = timeParts.map(v => v.toString().padStart(2, '0')).join(':');

                if (msDigits > 0) {
                    const msString = milliseconds.toString().padStart(msDigits, '0');
                    displayText += `.${msString}`;
                }
            }

            display.innerText = displayText;
            document.title = displayText;
            
            if (autoShrinkEnabled) {
                const charCount = displayText.length;
                let fontSize = 'clamp(4rem, 15vw, 8rem)';
                if (charCount > 12) fontSize = 'clamp(1.5rem, 6vw, 3rem)';
                else if (charCount > 8) fontSize = 'clamp(2.5rem, 9vw, 4.5rem)';
                display.style.fontSize = fontSize;
            } else {
                display.style.fontSize = 'clamp(4rem, 15vw, 8rem)';
            }
        }

        function loop() {
            updateTimer();
            requestAnimationFrame(loop);
        }
        
        loop();
    }
}

// ----------------------------------------------------------------
// GLOBAL INITIALIZATION
// ----------------------------------------------------------------
applyColorOverride();
applyBgColorOverride();
loadCustomFontFromStorage();

const isHelpActive = checkHelpAndModifiers();

if (!isHelpActive) {
    const targetTime = parseTime();
    // Initialize mouse hide immediately after parsing
    setupMouseHide();
    startTimer(targetTime);
}
