/* global cld_ajax_obj */
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
    const [icons, setIcons] = useState([]); // Array to store up to 5 icons with positions
    const [iconCategory, setIconCategory] = useState("All");
    const [scrollPosition, setScrollPosition] = useState(0);
    const [fontScrollPosition, setFontScrollPosition] = useState(0);
    const [quantity, setQuantity] = useState(1000);
    const [loading, setLoading] = useState(false);
    const [labelWidth, setLabelWidth] = useState(140);
    const [labelHeight, setLabelHeight] = useState(60);
    const categorySliderRef = useRef(null);
    const fontCategorySliderRef = useRef(null);
    const labelRef = useRef(null);

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

    const iconCategories = useMemo(() => {
        const categories = [
            {
                name: 'Letters',
                icon: 'a',
                icons: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']
            },
            {
                name: 'Numbers',
                icon: 'circle-number-1',
                icons: ['circle-number-0', 'circle-number-1', 'circle-number-2', 'circle-number-3', 'circle-number-4', 'circle-number-5',
                    'circle-number-6', 'circle-number-7', 'circle-number-8', 'circle-number-9', 'number-0', 'number-1', 'number-2',
                    'number-3', 'number-4', 'number-5', 'number-6', 'number-7', 'number-8', 'number-9', 'number-0-alt', 'number-1-alt',
                    'number-2-alt', 'number-3-alt', 'number-4-alt', 'number-5-alt', 'number-6-alt', 'number-7-alt', 'number-8-alt', 'number-9-alt']
            },
            {
                name: 'Arrows',
                icon: 'arrow-right',
                icons: ['arrow-down', 'arrow-down-from-line', 'arrow-down-left', 'arrow-down-right', 'arrow-down-short-wide',
                    'arrow-down-to-bracket', 'arrow-down-to-line', 'arrow-down-wide-short', 'arrow-left', 'arrow-left-arrow-right',
                    'arrow-left-from-line', 'arrow-left-to-line', 'arrow-right', 'arrow-right-from-bracket', 'arrow-right-from-line',
                    'arrow-right-to-bracket', 'arrow-right-to-line', 'arrow-rotate-left', 'arrow-rotate-right', 'arrow-trend-down',
                    'arrow-trend-up', 'arrow-turn-down-left', 'arrow-turn-down-right', 'arrow-turn-left-down', 'arrow-turn-left-up',
                    'arrow-turn-right-down', 'arrow-turn-right-up', 'arrow-turn-up-left', 'arrow-turn-up-right', 'arrow-up',
                    'arrows-left-right', 'arrows-repeat', 'arrows-rotate-clockwise', 'arrows-rotate-counter-clockwise']
            },
            {
                name: 'Shapes',
                icon: 'circle',
                icons: ['circle', 'circle-half', 'diamond', 'diamond-half', 'diamond-shape', 'hexagon', 'octagon', 'octagon-exclamation',
                    'square', 'square-checkmark', 'square-divide', 'square-equals', 'square-minus', 'square-plus', 'square-x',
                    'triangle', 'triangle-exclamation']
            },
            {
                name: 'Text Formatting',
                icon: 'align-left',
                icons: ['align-bottom', 'align-center-horizontal', 'align-center-vertical', 'align-left', 'align-right', 'align-text-center',
                    'align-text-justify', 'align-text-right', 'align-top', 'bold', 'italic', 'underline', 'cursor', 'cursor-click',
                    'grid', 'grid-masonry', 'maximize', 'minimize', 'sidebar-left', 'sidebar-right']
            },
            {
                name: 'Media',
                icon: 'microphone',
                icons: ['camera', 'camera-slash', 'desktop', 'film', 'headphones', 'image', 'images', 'laptop', 'microphone',
                    'microphone-slash', 'mobile', 'phone', 'phone-slash', 'tv', 'tv-retro', 'video', 'video-camera', 'video-camera-slash']
            },
            {
                name: 'Weather',
                icon: 'cloud',
                icons: ['cloud', 'cloud-arrow-downPUBLISH', 'cloud-arrow-up BALL', 'cloud-fog', 'cloud-lightning', 'cloud-rain', 'cloud-snow',
                    'moon', 'moon-cloud', 'moon-fog', 'rainbow', 'rainbow-cloud', 'sun', 'sun-cloud', 'sun-fog', 'wind']
            },
            {
                name: 'Tools',
                icon: 'key',
                icons: ['book', 'book-open', 'bookmark', 'bookmark-plus', 'books', 'key', 'key-skeleton', 'keyboard',
                    'toolbox', 'wrench', 'pencil', 'pen-nib', 'palette', 'ruler', 'scissors']
            },
            {
                name: 'Food & Drink',
                icon: 'utensils',
                icons: ['bottle', 'cake', 'cake-slice', 'citrus-slice', 'cocktail', 'cupcake', 'ice-cream', 'mug',
                    'pizza', 'soda', 'utensils', 'wine-glass']
            },
            {
                name: 'Currency',
                icon: 'dollar',
                icons: ['british-pound', 'dollar', 'euro', 'yen', 'credit-card', 'money', 'receipt', 'wallet']
            },
            {
                name: 'Emojis',
                icon: 'face-smile',
                icons: ['face-angry', 'face-cry', 'face-laugh', 'face-meh', 'face-melt', 'face-no-mouth', 'face-open-mouth',
                    'face-sad', 'face-smile', 'person', 'person-walking', 'person-wave', 'user', 'users']
            },
            {
                name: 'Sports',
                icon: 'dice',
                icons: ['baseball', 'baseball-bat', 'basketball', 'dice', 'die-1', 'die-2', 'die-3', 'die-4', 'die-5',
                    'die-6', 'football', 'game-controller', 'hockey', 'joystick', 'soccer', 'tennis-ball']
            },
            {
                name: 'Zodiac',
                icon: 'star',
                icons: ['aquarius', 'aries', 'cancer', 'capricorn', 'gemini', 'leo', 'libra', 'pisces', 'sagittarius',
                    'scorpio', 'taurus', 'virgo', 'star', 'star-half']
            }
        ];

        const allIcons = [...new Set(categories.flatMap(cat => cat.icons))];
        return [
            {
                name: 'All',
                icon: 'star',
                icons: allIcons
            },
            ...categories
        ];
    }, []);

    const displayedIcons = useMemo(() => {
        const selectedCategory = iconCategories.find(cat => cat.name === iconCategory);
        return selectedCategory ? selectedCategory.icons : [];
    }, [iconCategory, iconCategories]);

    const scrollCategories = useCallback((direction) => {
        const container = categorySliderRef.current;
        if (container) {
            const scrollAmount = 200;
            const newPosition = direction === 'left'
                ? scrollPosition - scrollAmount
                : scrollPosition + scrollAmount;

            container.scrollTo({
                left: newPosition,
                behavior: 'smooth'
            });

            setScrollPosition(newPosition);
        }
    }, [scrollPosition]);

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
        if (icons.length >= 5) {
            alert("You can only add up to 5 icons.");
            return;
        }
        // Default position: 0 (before all texts)
        setIcons([...icons, { name: iconName, position: 0 }]);
    }, [icons]);

    const removeIcon = useCallback((index) => {
        setIcons(icons.filter((_, i) => i !== index));
    }, [icons]);

    const updateIconPosition = useCallback((index, newPosition) => {
        const updatedIcons = [...icons];
        updatedIcons[index].position = newPosition;
        setIcons(updatedIcons);
    }, [icons]);

    const calculatePrice = useCallback(() => {
        let basePrice = labelWidth <= 100 ? 0.10 : labelWidth <= 140 ? 0.20 : 0.30;
        return {
            total: (quantity * basePrice).toFixed(2),
            perPiece: basePrice.toFixed(2)
        };
    }, [labelWidth, quantity]);

    const renderLabelContent = useCallback(() => {
        const fontSize = 16; // Fixed font size for consistency
        const texts = [text1, text2, text3].filter(t => t); // Only include non-empty texts
        const content = texts.length > 0 ? texts.join(' ') : 'Enter care instructions';

        // Sort icons by position to ensure they are rendered in the correct order
        const sortedIcons = [...icons].sort((a, b) => a.position - b.position);

        // Prepare label content with icons and texts
        const elements = [];
        let currentTextIndex = 0;

        sortedIcons.forEach((iconObj, iconIndex) => {
            const { name, position } = iconObj;

            // Add texts up to the current icon's position
            while (currentTextIndex < position && currentTextIndex < texts.length) {
                if (texts[currentTextIndex]) {
                    elements.push(
                        <span
                            key={`text-${currentTextIndex}`}
                            className="label-content"
                            style={{
                                wordBreak: 'break-word',
                                overflowWrap: 'break-word',
                                whiteSpace: 'normal',
                                lineHeight: 1.2,
                                margin: '0 4px',
                            }}
                        >
                            {texts[currentTextIndex]}
                        </span>
                    );
                }
                currentTextIndex++;
            }

            // Add the icon
            elements.push(
                <span
                    key={`icon-${iconIndex}`}
                    className="icon"
                    style={{
                        width: `${fontSize}px`,
                        height: `${fontSize}px`,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flex: '0 0 auto',
                        lineHeight: 1,
                        verticalAlign: 'middle',
                        margin: '0 4px',
                    }}
                >
                    <Icon name={name} color="#000000" />
                </span>
            );
        });

        // Add remaining texts
        while (currentTextIndex < texts.length) {
            if (texts[currentTextIndex]) {
                elements.push(
                    <span
                        key={`text-${currentTextIndex}`}
                        className="label-content"
                        style={{
                            wordBreak: 'break-word',
                            overflowWrap: 'break-word',
                            whiteSpace: 'normal',
                            lineHeight: 1.2,
                            margin: '0 4px',
                        }}
                    >
                        {texts[currentTextIndex]}
                    </span>
                );
            }
            currentTextIndex++;
        }

        if (elements.length === 0) {
            elements.push(
                <span
                    key="default-text"
                    className="label-content"
                    style={{
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                        whiteSpace: 'normal',
                        lineHeight: 1.2,
                        margin: '0 4px',
                    }}
                >
                    {content}
                </span>
            );
        }

        return (
            <div className="label-container">
                <div
                    className="label-content-wrapper"
                    style={{
                        background: '#FFFFFF',
                        color: '#000000',
                        fontFamily: font,
                        width: '100%',
                        height: '100%',
                        boxSizing: 'border-box',
                        position: 'relative',
                    }}
                >
                    <div
                        className="label-text-display"
                        style={{
                            fontSize: `${fontSize}px`,
                            display: 'flex',
                            flexDirection: 'row',
                            flexWrap: 'wrap',
                            padding: '8px 12px',
                            margin: '0',
                            lineHeight: 1.2,
                            boxSizing: 'border-box',
                            width: '100%',
                            height: '100%',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            gap: '8px',
                        }}
                    >
                        {elements}
                    </div>
                </div>
            </div>
        );
    }, [text1, text2, text3, font, icons]);

    const captureLabel = useCallback(async () => {
        try {
            if (document.fonts && document.fonts.ready) {
                await document.fonts.ready;
            }

            const container = document.createElement('div');
            container.style.cssText = `
                position: absolute;
                left: -9999px;
                top: -9999px;
                width: ${labelHeight * 3}px;
                height: ${labelWidth * 3}px;
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
                    transform: translateY(-8%);
                    display: flex;
                    flex-direction: row;
                    flex-wrap: wrap;
                    align-items: center;
                    justify-content: center;
                    width: auto !important;
                    height: auto !important;
                    gap: 12px;
                    white-space: normal !important;
                    overflow: visible !important;
                    max-height: none !important;
                    max-width: none !important;
                `;
            }

            const labelContent = clone.querySelectorAll('.label-content');
            labelContent.forEach(content => {
                content.style.cssText += `
                    transform: translateY(-8%);
                    display: inline-block;
                    vertical-align: middle;
                    white-space: normal !important;
                    overflow: visible !important;
                    max-height: none !important;
                    max-width: none !important;
                    line-height: 1.2 !important;
                `;
            });

            const iconElements = clone.querySelectorAll('.icon');
            iconElements.forEach(icon => {
                icon.style.cssText += `
                    transform: translateY(-8%);
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
                width: labelHeight * 3,
                height: labelWidth * 3,
                onclone: (doc, element) => {
                    const allElements = element.querySelectorAll('*');
                    allElements.forEach(el => {
                        el.style.maxHeight = 'none';
                        el.style.overflow = 'visible';
                        el.style.height = 'auto';
                    });

                    const textDisplay = element.querySelector('.label-text-display');
                    const icons = element.querySelectorAll('.icon');
                    const labelContent = element.querySelectorAll('.label-content');

                    if (textDisplay) {
                        textDisplay.style.transform = 'translateY(-8%)';
                    }
                    icons.forEach(icon => {
                        icon.style.transform = 'translateY(-8%)';
                    });
                    labelContent.forEach(content => {
                        content.style.transform = 'translateY(-8%)';
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

    // Define possible positions for icons
    const iconPositionOptions = useMemo(() => {
        const texts = [text1, text2, text3].filter(t => t);
        const options = [{ value: 0, label: 'Before Text 1' }];

        texts.forEach((_, index) => {
            if (index < texts.length) {
                options.push({ value: index + 1, label: `After Text ${index + 1}` });
            }
        });

        return options;
    }, [text1, text2, text3]);

    return (
        <div className="label-designer-wrapper">
            <div className="designer-container">
                <div className="designer-controls">
                    <div className="control-group">
                        <div className="group-title">
                            Care Instructions
                            <span className="help-icon">?
                                <span className="tooltip">
                                    Enter the care instructions for your label.
                                </span>
                            </span>
                        </div>
                        <div className="text-control-wrapper">
                            <input
                                type="text"
                                value={text1}
                                onChange={e => setText1(e.target.value)}
                                className="label-text-input"
                                placeholder="Enter first line"
                                maxLength={70}
                            />
                            <input
                                type="text"
                                value={text2}
                                onChange={e => setText2(e.target.value)}
                                className="label-text-input"
                                placeholder="Enter second line"
                                maxLength={70}
                            />
                            <input
                                type="text"
                                value={text3}
                                onChange={e => setText3(e.target.value)}
                                className="label-text-input"
                                placeholder="Enter third line"
                                maxLength={70}
                            />
                        </div>
                    </div>

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

                    <div className="control-group">
                        <div className="group-title">
                            Icons
                            <span className="help-icon">?
                                <span className="tooltip">
                                    Add up to 5 icons to enhance your care label design.
                                </span>
                            </span>
                        </div>
                        <div className="icon-category-section">
                            <button
                                className="scroll-button left"
                                onClick={() => scrollCategories('left')}
                                disabled={scrollPosition <= 0}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M15 18l-6-6 6-6" />
                                </svg>
                            </button>
                            <div className="icon-category-slider" ref={categorySliderRef}>
                                {iconCategories.map(category => (
                                    <button
                                        key={category.name}
                                        className={`icon-category-button ${iconCategory === category.name ? 'active' : ''}`}
                                        onClick={() => setIconCategory(category.name)}
                                    >
                                        <span className="category-icon">
                                            <Icon name={category.icon} color="#000000" />
                                        </span>
                                        <span className="category-name">{category.name}</span>
                                    </button>
                                ))}
                            </div>
                            <button
                                className="scroll-button right"
                                onClick={() => scrollCategories('right')}
                                disabled={scrollPosition >= (categorySliderRef.current?.scrollWidth - categorySliderRef.current?.clientWidth)}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M9 18l6-6-6-6" />
                                </svg>
                            </button>
                        </div>
                        <div className="icon-options-grid">
                            {displayedIcons.map((iconName) => (
                                <div key={iconName} className="icon-option-wrapper">
                                    <button
                                        className="icon-option"
                                        onClick={() => addIcon(iconName)}
                                    >
                                        <span className="icon-preview">
                                            <Icon name={iconName} color="#000000" size={24} />
                                        </span>
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="selected-icons">
                            {icons.map((iconObj, index) => (
                                <div key={index} className="selected-icon">
                                    <Icon name={iconObj.name} color="#000000" size={16} />
                                    <select
                                        value={iconObj.position}
                                        onChange={(e) => updateIconPosition(index, parseInt(e.target.value))}
                                    >
                                        {iconPositionOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                    <button onClick={() => removeIcon(index)}>Remove</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

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
                            style={{
                                width: `${labelHeight * 3}px`,
                                height: `${labelWidth * 3}px`,
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
