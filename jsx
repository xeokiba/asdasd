/* global cld_ajax_obj */
import { useState, useRef, useCallback, useMemo } from "react";
import './labelDesigner.css';
import Icon from './components/icon';
import axios from 'axios';
import html2canvas from 'html2canvas';

export default function LabelDesigner() {
    const [text1, setText1] = useState("");
    const [text2, setText2] = useState("");
    const [text3, setText3] = useState("");
    const [font, setFont] = useState("Arial");
    const [fontCategory, setFontCategory] = useState("All");
    const [icons, setIcons] = useState([]); // Array to store up to 5 icons
    const [fontScrollPosition, setFontScrollPosition] = useState(0);
    const [quantity, setQuantity] = useState(1000);
    const [loading, setLoading] = useState(false);
    const [labelWidth] = useState(140);
    const [labelHeight] = useState(60);
    const fontCategorySliderRef = useRef(null);
    const labelRef = useRef(null);

    // Character limits for Text1 and Text2
    const maxCharsText1 = 20; // Adjusted based on label width
    const maxCharsText2 = 60;

    // %7 büyütme faktörü
    const scaleFactor = 1.15;

    // Dynamic font size for Text1 based on character count
    const calculateFontSize = (text) => {
        const baseFontSize = 24; // Maximum font size
        const minFontSize = 12; // Minimum font size
        const charsPerLine = 10; // Approximate characters per line before scaling down
        const length = text.length;

        if (length <= charsPerLine) {
            return baseFontSize;
        }

        const scaleFactor = charsPerLine / length;
        const newFontSize = Math.max(minFontSize, baseFontSize * scaleFactor);
        return Math.round(newFontSize);
    };

    const fontSizeText1 = calculateFontSize(text1);

    const handleTextChange = (setter, maxChars) => (e) => {
        const value = e.target.value;
        if (value.length <= maxChars) {
            setter(value);
        }
    };

    const fontCategories = useMemo(() => {
        const baseCategories = {
            "Sans Serif": [
                "Roboto", "Open Sans", "Montserrat", "Poppins", "Inter",
                "Lato", "Rubik", "Work Sans", "Nunito", "Source Sans 3",
                "Barlow", "Public Sans"
            ],
            "Serif": [
                "Playfair Display", "Merriweather", "Lora", "Crimson Pro",
                "Libre Baskerville", "EB Garamond", "Zilla Slab", "Cardo",
                "Bitter", "PT Serif", "Vollkorn", "Source Serif 4"
            ],
            "Handwriting": [
                "Caveat", "Dancing Script", "Patrick Hand", "Indie Flower",
                "Kalam", "Shadows Into Light", "Amatic SC", "Architects Daughter",
                "Gochi Hand", "Annie Use Your Telescope", "Coming Soon",
                "Nothing You Could Do"
            ],
            "Decorative": [
                "Bebas Neue", "Oswald", "Lobster", "Abril Fatface", "Bangers",
                "Alfa Slab One", "Shrikhand", "Fredericka the Great",
                "Black Han Sans", "Big Shoulders", "Passion One", "Rammetto One"
            ],
            "Modern": [
                "Futura", "Manrope", "Overpass", "Jost", "Sora", "Outfit",
                "Chivo", "Karla", "Archivo", "DM Sans", "Exo 2", "Cabin"
            ],
            "Vintage": [
                "Special Elite", "Old Standard TT", "Cinzel", "IM Fell English",
                "UnifrakturMaguntia", "Spectral", "Rye", "Almendra", "Pirata One",
                "Metal Mania", "Germania One", "Caesar Dressing"
            ],
            "Script": [
                "Great Vibes", "Sacramento", "Alex Brush", "Kaushan Script",
                "Parisienne", "Yellowtail", "Tangerine", "Clicker Script",
                "Allura", "Bad Script", "Lovers Quarrel", "Cedarville Cursive"
            ],
            "Monospace": [
                "Fira Code", "IBM Plex Mono", "Space Mono", "Inconsolata",
                "Roboto Mono", "Source Code Pro", "JetBrains Mono", "Courier Prime",
                "Overpass Mono", "Ubuntu Mono", "VT323", "Share Tech Mono"
            ],
        };

        const allFonts = [...new Set(Object.values(baseCategories).flat())];
        return {
            "All": allFonts,
            ...baseCategories
        };
    }, []);

    // Sabit ikon listesi
    const iconNames = useMemo(() => [
        "any-solvent-except-trichloroethylene", "any-solvent", "bleach", "chlorine-bleach", "delicate", "do-not-bleach",
        "do-not-dry-clean", "do-not-dry", "do-not-iron", "do-not-tumble-dry", "do-not-wash", "do-not-wet-clean",
        "drip-dry-in-shade", "drip-dry", "dry-clean-any-solvent-reduced-misture", "dry-clean-any-solvent-short-cycle",
        "dry-clean", "dry-flat", "dry", "hand-wash-cold", "hand-wash-warm", "hand-wash", "hang-to-dry", "high-heat",
        "iron-high-no-steam", "iron-high-temperature", "iron-low-no-steam", "iron-low-temperature", "iron-medium-no-steam",
        "iron-medium-temperature", "iron-no-steam", "iron", "low-heat-1", "low-heat", "machine-wash-cold-gentle-2",
        "machine-wash-cold-gentle", "machine-wash-cold-permanent-press-30c", "machine-wash-cold-permanent-press",
        "machine-wash-delicate", "machine-wash-hot-gentle-2", "machine-wash-hot-gentle-3", "machine-wash-hot-gentle-5",
        "machine-wash-hot-gentle-50c", "machine-wash-hot-gentle-60c", "machine-wash-hot-gentle-70c", "machine-wash-hot-gentle",
        "machine-wash-hot-permanent-press-2", "machine-wash-hot-permanent-press-3", "machine-wash-hot-permanent-press-50c",
        "machine-wash-hot-permanent-press-60c", "machine-wash-hot-permanent-press-70c", "machine-wash-hot-permanent-press-95c",
        "machine-wash-hot-permanent-press", "machine-wash-hot-permanent-press4", "machine-wash-permanent-press-5",
        "machine-wash-permanent-press", "machine-wash-warm-gentle-2", "machine-wash-warm-gentle",
        "machine-wash-warm-permanent-press-2", "machine-wash-warm-permanent-press-40c", "machine-wash", "medium-heat",
        "no-heat", "no-steam", "non-chlorine-bleach-2", "non-chlorine-bleach", "not-professional-wet-cleaning",
        "permanent-press", "petroleum-solvent-only", "professional-dry-cleaning-in-hydrocarbons", "professional-wet-cleaning",
        "reduced-moisture", "shade-dry", "short-cycle", "tumble-dry-gentle-high-heat", "tumble-dry-gentle-low-heat",
        "tumble-dry-gentle-medium-heat", "tumble-dry-gentle", "tumble-dry-permanent-press-high-heat",
        "tumble-dry-permanent-press-medium-heat", "tumble-dry-permanent-press-no-heat", "tumble-dry-permanent-press",
        "tumble-dry-premanent-press-low-heat", "water-30c-2", "water-30c", "water-40c-2", "water-40c", "water-50c-2",
        "water-50c", "water-60c-2", "water-60c", "water-70c-2", "water-70c", "water-95c-2", "water-95c", "wet-cleaning",
        "wring"
    ], []);

    const scrollFontCategories = useCallback((direction) => {
        const container = fontCategorySliderRef.current;
        if (container) {
            const scrollAmount = 200;
            const newPosition = direction === 'left'
                ? fontScrollPosition - scrollAmount
                : fontScrollPosition + scrollAmount;

            container.scrollTo({
                left: newPosition,
                behavior: 'smooth'
            });

            setFontScrollPosition(newPosition);
        }
    }, [fontScrollPosition]);

    const addIcon = useCallback((iconName) => {
        // İkon zaten seçilmişse ekleme yapma
        if (icons.some(icon => icon.name === iconName)) {
            return;
        }

        if (icons.length >= 5) {
            return;
        }
        setIcons([...icons, { name: iconName }]);
    }, [icons]);

    const removeIcon = useCallback((iconName) => {
        setIcons(icons.filter(icon => icon.name !== iconName));
    }, [icons]);

    const calculatePrice = useCallback(() => {
        let basePrice = labelWidth <= 100 ? 0.10 : labelWidth <= 140 ? 0.20 : 0.30;
        return {
            total: (quantity * basePrice).toFixed(2),
            perPiece: basePrice.toFixed(2)
        };
    }, [labelWidth, quantity]);

    const renderLabelContent = useCallback(() => {
        const fontSizeText2 = 16; // Fixed font size for Text2
        const fontSizeText3 = 16; // Fixed font size for Text3

        return (
            <div className="label-container">
                <div
                    className="label-content-wrapper"
                    style={{
                        background: '#FFFFFF',
                        color: '#000000',
                        width: '100%',
                        height: '100%',
                        boxSizing: 'border-box',
                        position: 'relative',
                    }}
                >
                    <div className="label-text-display">
                        {/* Text1: No wrapping */}
                        <div className="text-section top">
                            <span
                                className="text-display"
                                style={{
                                    fontFamily: font, // Sadece Text1 için font uygulanır
                                    fontSize: `${fontSizeText1}px`,
                                    whiteSpace: 'nowrap', // Prevent wrapping
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                }}
                            >
                                {text1 || ""}
                            </span>
                        </div>

                        {/* Text2: Max 3 lines */}
                        {text2 && (
                            <div className="text-section top-adjacent">
                                <span
                                    className="text-display"
                                    style={{
                                        fontFamily: 'Arial', // Text2 için sabit font
                                        fontSize: `${fontSizeText2}px`,
                                        display: '-webkit-box',
                                        WebkitLineClamp: 3, // Max 3 lines
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                    }}
                                >
                                    {text2 || ""}
                                </span>
                            </div>
                        )}

                        {/* Icons section - always centered */}
                        {icons.length > 0 && (
                            <div className="icons-section">
                                {icons.map((iconObj, index) => (
                                    <span
                                        key={`icon-${index}`}
                                        className="icon"
                                    >
                                    <Icon name={iconObj.name} color="#000000" size={30} />
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Text3: Max 3 lines, wrap downward */}
                        {text3 && (
                            <div className="text-section bottom">
                                <span
                                    className="text-display"
                                    style={{
                                        fontFamily: 'Arial', // Text3 için sabit font
                                        fontSize: `${fontSizeText3}px`,
                                        display: '-webkit-box',
                                        WebkitLineClamp: 3, // Max 3 lines
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        overflowWrap: 'break-word',
                                        wordBreak: 'break-word',
                                    }}
                                >
                                    {text3 || ""}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }, [text1, text2, text3, font, icons, fontSizeText1]);

    const captureLabel = useCallback(async () => {
        try {
            if (document.fonts && document.fonts.ready) {
                await document.fonts.ready;
            }

            const scaledWidth = (labelHeight * 3) * scaleFactor;
            const scaledHeight = (labelWidth * 3) * scaleFactor;

            const container = document.createElement('div');
            container.style.cssText = `
                position: absolute;
                left: -9999px;
                top: -9999px;
                width: ${scaledWidth}px;
                height: ${scaledHeight}px;
                background-color: #FFFFFF;
                display: flex;
                align-items: center;
                justify-content: center;
            `;

            const clone = labelRef.current.cloneNode(true);

            const contentWrapper = clone.querySelector('.label-content-wrapper');
            if (contentWrapper) {
                contentWrapper.style.cssText += `
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1;
                    padding: 20px !important;
                    max-height: none !important;
                    max-width: none !important;
                    overflow: visible !important;
                    height: auto !important;
                `;
            }

            const textDisplay = clone.querySelector('.label-text-display');
            if (textDisplay) {
                textDisplay.style.cssText += `
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    width: auto !important;
                    height: auto !important;
                    gap: 10px;
                    white-space: normal !important;
                    overflow: visible !important;
                    max-height: none !important;
                    max-width: none !important;
                `;
            }

            const textSections = clone.querySelectorAll('.text-section');
            textSections.forEach(section => {
                if (section.classList.contains('top')) {
                    section.style.cssText += `
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    `;
                } else if (section.classList.contains('top-adjacent') || section.classList.contains('bottom')) {
                    section.style.cssText += `
                        display: -webkit-box;
                        -webkit-line-clamp: 3;
                        -webkit-box-orient: vertical;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        overflow-wrap: break-word;
                        word-break: break-word;
                    `;
                }
            });

            const iconElements = clone.querySelectorAll('.icon');
            iconElements.forEach(icon => {
                icon.style.cssText += `
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    overflow: visible !important;
                `;
            });

            container.appendChild(clone);
            document.body.appendChild(container);

            await new Promise(resolve => setTimeout(resolve, 100));

            const canvas = await html2canvas(container, {
                scale: 2,
                backgroundColor: '#FFFFFF',
                logging: false,
                useCORS: true,
                width: scaledWidth,
                height: scaledHeight,
                onclone: (doc, element) => {
                    const allElements = element.querySelectorAll('*');
                    allElements.forEach(el => {
                        el.style.maxHeight = 'none';
                        el.style.overflow = 'visible';
                        el.style.height = 'auto';
                    });
                }
            });

            document.body.removeChild(container);
            return canvas.toDataURL('image/png');

        } catch (error) {
            console.error('Error capturing label:', error);
            return null;
        }
    }, [labelWidth, labelHeight]);

    const addToCart = useCallback(async () => {
        if (loading || (!text1.trim() && !text2.trim() && !text3.trim())) {
            alert('Please add at least one line of label text');
            return;
        }

        setLoading(true);

        try {
            const labelImage = await captureLabel();
            if (!labelImage) {
                throw new Error('Failed to create label image');
            }

            const designData = {
                text1,
                text2,
                text3,
                font,
                icons,
                labelWidth,
                labelHeight,
                imageData: labelImage,
                created_at: '2025-04-30 12:00:00',
                created_by: 'user'
            };

            const formData = new FormData();
            formData.append('action', 'add_to_cart_custom_label');
            formData.append('product_id', document.getElementById('label-designer-root')?.dataset?.productId || '1');
            formData.append('quantity', quantity);
            formData.append('label_design', JSON.stringify(designData));
            formData.append('security', cld_ajax_obj?.nonce || 'nonce_placeholder');

            const response = await axios({
                method: 'POST',
                url: cld_ajax_obj?.ajax_url || 'https://example.com/wp-admin/admin-ajax.php',
                data: formData,
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                alert('Product successfully added to cart! Click OK to continue to cart.');
                window.location.href = response.data.data?.cart_url || '/cart';
            } else {
                throw new Error(response.data.data?.message || 'Error adding to cart');
            }
        } catch (error) {
            console.error('Add to cart error:', error);
            alert(error.message || 'An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [loading, text1, text2, text3, font, icons, labelWidth, labelHeight, quantity, captureLabel]);

    const prices = useMemo(() => calculatePrice(), [calculatePrice]);

    return (
        <div className="label-designer-wrapper">
            <div className="designer-container">
                <div className="designer-controls">
                    {/* Text Input Section */}
                    <div className="control-group">
                        <div className="text-input-section">
                            <div className="group-title">
                                Text Settings
                                <span className="help-icon">?
                                    <span className="tooltip">
                                        Enter the text for your label here.
                                    </span>
                                </span>
                            </div>
                            <div className="text-input-group">
                                <label htmlFor="text1">Text 1</label>
                                <input
                                    type="text"
                                    id="text1"
                                    placeholder="Enter Text 1"
                                    value={text1}
                                    onChange={handleTextChange(setText1, maxCharsText1)}
                                />
                            </div>
                            <div className="text-input-group">
                                <label htmlFor="text2">Text 2</label>
                                <input
                                    type="text"
                                    id="text2"
                                    placeholder="Enter Text 2"
                                    value={text2}
                                    onChange={handleTextChange(setText2, maxCharsText2)}
                                />
                            </div>
                            <div className="text-input-group">
                                <label htmlFor="text3">Text 3</label>
                                <input
                                    type="text"
                                    id="text3"
                                    placeholder="Enter Text 3"
                                    value={text3}
                                    onChange={(e) => setText3(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Font Selection Section */}
                    <div className="control-group">
                        <div className="group-title">
                            Font Style
                            <span className="help-icon">?
                                <span className="tooltip">
                                    Choose from a variety of fonts to customize your label's appearance.
                                </span>
                            </span>
                        </div>
                        <div className="font-category-section">
                            <button
                                className="scroll-button left"
                                onClick={() => scrollFontCategories('left')}
                                disabled={fontScrollPosition <= 0}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M15 18l-6-6 6-6" />
                                </svg>
                            </button>
                            <div className="font-category-slider" ref={fontCategorySliderRef}>
                                {Object.entries(fontCategories).map(([category, fonts]) => (
                                    <button
                                        key={category}
                                        className={`font-category-button ${fontCategory === category ? 'active' : ''}`}
                                        onClick={() => setFontCategory(category)}
                                    >
                                        <span
                                            className="font-preview-text"
                                            style={{ fontFamily: fonts[0] }}
                                        >
                                            Aa
                                        </span>
                                        <span className="font-category-name">{category}</span>
                                    </button>
                                ))}
                            </div>
                            <button
                                className="scroll-button right"
                                onClick={() => scrollFontCategories('right')}
                                disabled={fontScrollPosition >= (fontCategorySliderRef.current?.scrollWidth - fontCategorySliderRef.current?.clientWidth)}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M9 18l6-6-6-6" />
                                </svg>
                            </button>
                        </div>
                        <div className="font-options-grid">
                            {fontCategories[fontCategory].map(fontName => (
                                <button
                                    key={fontName}
                                    className={`font-option ${font === fontName ? 'selected' : ''}`}
                                    style={{ fontFamily: fontName }}
                                    onClick={() => setFont(fontName)}
                                >
                                    <span className="font-preview">Aa</span>
                                    <span className="font-name">{fontName}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Icon Selection Section */}
                    <div className="control-group">
                        <div className="group-title">
                            Icons
                            <span className="help-icon">?
                                <span className="tooltip">
                                    Add up to 5 icons to enhance your care label design.
                                </span>
                            </span>
                        </div>
                        <div className="control-selected-icons">
                            {icons.map((iconObj, index) => (
                                <div key={index} className="control-selected-icon">
                                    <Icon name={iconObj.name} color="#000000" size={16} />
                                    <button className="control-remove-icon" onClick={() => removeIcon(iconObj.name)}>
                                        <svg viewBox="0 0 24 24" width="12" height="12">
                                            <path d="M6 6l12 12M18 6L6 18" stroke="white" strokeWidth="2" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="icon-options-grid">
                            {iconNames.map((iconName) => {
                                const isSelected = icons.some(icon => icon.name === iconName);
                                return (
                                    <div key={iconName} className="icon-option-wrapper">
                                        <button
                                            className={`icon-option ${isSelected ? 'selected' : ''}`}
                                            onClick={() => addIcon(iconName)}
                                            disabled={isSelected}
                                        >
                                            <span className="icon-preview">
                                                <Icon name={iconName} color="#000000" size={24} />
                                            </span>
                                        </button>
                                        {isSelected && (
                                            <button className="control-remove-icon" onClick={() => removeIcon(iconName)}>
                                                <svg viewBox="0 0 24 24" width="12" height="12">
                                                    <path d="M6 6l12 12M18 6L6 18" stroke="white" strokeWidth="2" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Label Preview */}
                <div className="designer-canvas" style={{ height: 'auto', minHeight: '600px' }}>
                    <div className="preview-header">
                        <div className="preview-info">
                            <span className="preview-title">Care Label Preview</span>
                            <div className="dimension-info">
                                <span className="actual-size">{`${labelWidth}x${labelHeight}mm`}</span>
                            </div>
                        </div>
                    </div>
                    <div className="canvas-frame">
                        <div
                            ref={labelRef}
                            className="label-preview"
                            data-width={`${(labelHeight * 3) * scaleFactor}px`}
                            data-height={`${(labelWidth * 3) * scaleFactor}px`}
                            style={{
                                width: `${(labelHeight * 3) * scaleFactor}px`,
                                height: `${(labelWidth * 3) * scaleFactor}px`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            {renderLabelContent()}
                        </div>
                    </div>
                    <div className="order-section">
                        <div className="quantity-selector">
                            <label htmlFor="quantity">Quantity</label>
                            <select
                                id="quantity"
                                value={quantity}
                                onChange={(e) => setQuantity(Number(e.target.value))}
                                disabled={loading}
                            >
                                {[1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000].map(q => (
                                    <option key={q} value={q}>{q} pieces</option>
                                ))}
                            </select>
                        </div>
                        <div className="price-info">
                            <div className="total-price">
                                <span>Total Price:</span>
                                <span className="amount">${prices.total}</span>
                            </div>
                            <div className="price-per-piece">
                                ${prices.perPiece} per piece
                            </div>
                        </div>
                        <button
                            className={`add-to-cart-button ${loading ? 'loading' : ''}`}
                            onClick={addToCart}
                            disabled={loading || (!text1.trim() && !text2.trim() && !text3.trim())}
                        >
                            {loading ? 'Adding to Cart...' : 'Add to Cart'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
