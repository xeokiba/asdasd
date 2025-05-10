import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import axios from 'axios';
import html2canvas from 'html2canvas';
import './CardDesigner.css';
import Icon from './icon/icon';

// Sabitler (Options)
const materialOptions = [
    { name: 'standard', label: 'Standard', description: 'Basic cardboard material' },
    { name: 'premium', label: 'Premium', description: 'High-quality cardboard' },
    { name: 'recycled', label: 'Recycled', description: 'Eco-friendly recycled material' },
];

const applicationMethods = [
    { name: 'none', label: 'None', description: 'No attachment method', icon: '⨯' },
    { name: 'hole', label: 'Hole', description: 'Punch hole for attachment', icon: '○' },
    { name: 'string', label: 'String', description: 'String attachment', icon: '─' },
    { name: 'adhesive', label: 'Adhesive', description: 'Adhesive back', icon: '🩹' },
];

const extraOptions = [
    { name: 'cornerRadius', label: 'Rounded Corners', description: 'Add rounded corners' },
    { name: 'glossyFinish', label: 'Glossy Finish', description: 'Add a glossy finish' },
    { name: 'reinforced', label: 'Reinforced', description: 'Add reinforcement' },
];

const frameStyles = [
    { name: 'none', label: 'None', description: 'No frame' },
    { name: 'single', label: 'Single', description: 'Single-line frame' },
];

export default function CardDesigner() {
    const [design, setDesign] = useState({
        shape: 'rectangle',
        textA: '',
        textB: '',
        font: 'Roboto',
        fontSize: 14,
        textColor: '#000000',
        backgroundColor: '#ffffff',
        icon: 'none',
        iconPosition: 'none',
        size: 'medium',
        cardboardType: 'standard',
        applicationMethod: 'hole',
        frameStyle: 'none',
        extras: {
            cornerRadius: false,
            glossyFinish: false,
            reinforced: false,
        },
        quantity: 1000,
        sameBack: true,
    });

    const [textPositionA, setTextPositionA] = useState({ x: 0, y: 0, scale: 1 });
    const [textPositionB, setTextPositionB] = useState({ x: 0, y: 0, scale: 1 });
    const [imageA, setImageA] = useState(null);
    const [imageB, setImageB] = useState(null);
    const [imagePositionA, setImagePositionA] = useState({ x: 0, y: 0, scale: 1 });
    const [imagePositionB, setImagePositionB] = useState({ x: 0, y: 0, scale: 1 });
    const [fontCategory, setFontCategory] = useState('All');
    const [iconCategory, setIconCategory] = useState('All');
    const [loading, setLoading] = useState(false);
    const [overlay, setOverlay] = useState({ show: false, message: '', onConfirm: null });
    const [scrollPosition, setScrollPosition] = useState(0);
    const [fontScrollPosition, setFontScrollPosition] = useState(0);

    const categorySliderRef = useRef(null);
    const fontCategorySliderRef = useRef(null);
    const cardARef = useRef(null);
    const cardBRef = useRef(null);

    const fontCategories = useMemo(() => {
        const baseCategories = {
            "Sans Serif": ["Roboto", "Open Sans", "Montserrat", "Poppins", "Inter", "Lato", "Rubik", "Work Sans", "Nunito", "Source Sans 3", "Barlow", "Public Sans"],
            "Serif": ["Playfair Display", "Merriweather", "Lora", "Crimson Pro", "Libre Baskerville", "EB Garamond", "Zilla Slab", "Cardo", "Bitter", "PT Serif", "Vollkorn", "Source Serif 4"],
            "Handwriting": ["Caveat", "Dancing Script", "Patrick Hand", "Indie Flower", "Kalam", "Shadows Into Light", "Amatic SC", "Architects Daughter", "Gochi Hand", "Annie Use Your Telescope", "Coming Soon", "Nothing You Could Do"],
            "Decorative": ["Bebas Neue", "Oswald", "Lobster", "Abril Fatface", "Bangers", "Alfa Slab One", "Shrikhand", "Fredericka the Great", "Black Han Sans", "Big Shoulders Display", "Passion One", "Rammetto One"],
            "Modern": ["Futura", "Manrope", "Overpass", "Jost", "Sora", "Outfit", "Chivo", "Karla", "Archivo", "DM Sans", "Exo 2", "Cabin"],
            "Vintage": ["Special Elite", "Old Standard TT", "Cinzel", "IM Fell English", "UnifrakturMaguntia", "Spectral", "Rye", "Almendra", "Pirata One", "Metal Mania", "Germania One", "Caesar Dressing"],
            "Script": ["Great Vibes", "Sacramento", "Alex Brush", "Kaushan Script", "Parisienne", "Yellowtail", "Tangerine", "Clicker Script", "Allura", "Bad Script", "Lovers Quarrel", "Cedarville Cursive"],
            "Monospace": ["Fira Code", "IBM Plex Mono", "Space Mono", "Inconsolata", "Roboto Mono", "Source Code Pro", "JetBrains Mono", "Courier Prime", "Overpass Mono", "Ubuntu Mono", "VT323", "Share Tech Mono"]
        };
        const allFonts = [...new Set(Object.values(baseCategories).flat())];
        return { "All": allFonts, ...baseCategories };
    }, []);

    const iconCategories = useMemo(() => {
        const categories = [
            { name: 'Letters', icon: 'a', icons: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'] },
            { name: 'Numbers', icon: 'circle-number-1', icons: ['circle-number-0', 'circle-number-1', 'circle-number-2', 'circle-number-3', 'circle-number-4', 'circle-number-5', 'circle-number-6', 'circle-number-7', 'circle-number-8', 'circle-number-9', 'number-0', 'number-1', 'number-2', 'number-3', 'number-4', 'number-5', 'number-6', 'number-7', 'number-8', 'number-9', 'number-0-alt', 'number-1-alt', 'number-2-alt', 'number-3-alt', 'number-4-alt', 'number-5-alt', 'number-6-alt', 'number-7-alt', 'number-8-alt', 'number-9-alt'] },
            { name: 'Arrows', icon: 'arrow-right', icons: ['arrow-down', 'arrow-down-from-line', 'arrow-down-left', 'arrow-down-right', 'arrow-down-short-wide', 'arrow-down-to-bracket', 'arrow-down-to-line', 'arrow-down-wide-short', 'arrow-left', 'arrow-left-arrow-right', 'arrow-left-from-line', 'arrow-left-to-line', 'arrow-right', 'arrow-right-from-bracket', 'arrow-right-from-line', 'arrow-right-to-bracket', 'arrow-right-to-line', 'arrow-rotate-left', 'arrow-rotate-right', 'arrow-trend-down', 'arrow-trend-up', 'arrow-turn-down-left', 'arrow-turn-down-right', 'arrow-turn-left-down', 'arrow-turn-left-up', 'arrow-turn-right-down', 'arrow-turn-right-up', 'arrow-turn-up-left', 'arrow-turn-up-right', 'arrow-up', 'arrows-left-right', 'arrows-repeat', 'arrows-rotate-clockwise', 'arrows-rotate-counter-clockwise'] },
            { name: 'Shapes', icon: 'circle', icons: ['circle', 'circle-half', 'diamond', 'diamond-half', 'diamond-shape', 'hexagon', 'octagon', 'octagon-exclamation', 'square', 'square-checkmark', 'square-divide', 'square-equals', 'square-minus', 'square-plus', 'square-x', 'triangle', 'triangle-exclamation'] },
            { name: 'Text Formatting', icon: 'align-left', icons: ['align-bottom', 'align-center-horizontal', 'align-center-vertical', 'align-left', 'align-right', 'align-text-center', 'align-text-justify', 'align-text-right', 'align-top', 'bold', 'italic', 'underline', 'cursor', 'cursor-click', 'grid', 'grid-masonry', 'maximize', 'minimize', 'sidebar-left', 'sidebar-right'] },
            { name: 'Media', icon: 'microphone', icons: ['camera', 'camera-slash', 'desktop', 'film', 'headphones', 'image', 'images', 'laptop', 'microphone', 'microphone-slash', 'mobile', 'phone', 'phone-slash', 'tv', 'tv-retro', 'video', 'video-camera', 'video-camera-slash'] },
            { name: 'Weather', icon: 'cloud', icons: ['cloud', 'cloud-arrow-down', 'cloud-arrow-up', 'cloud-fog', 'cloud-lightning', 'cloud-rain', 'cloud-snow', 'moon', 'moon-cloud', 'moon-fog', 'rainbow', 'rainbow-cloud', 'sun', 'sun-cloud', 'sun-fog', 'wind'] },
            { name: 'Tools', icon: 'key', icons: ['book', 'book-open', 'bookmark', 'bookmark-plus', 'books', 'key', 'key-skeleton', 'keyboard', 'toolbox', 'wrench', 'pencil', 'pen-nib', 'palette', 'ruler', 'scissors'] },
            { name: 'Food & Drink', icon: 'utensils', icons: ['bottle', 'cake', 'cake-slice', 'citrus-slice', 'cocktail', 'cupcake', 'ice-cream', 'mug', 'pizza', 'soda', 'utensils', 'wine-glass'] },
            { name: 'Currency', icon: 'dollar', icons: ['british-pound', 'dollar', 'euro', 'yen', 'credit-card', 'money', 'receipt', 'wallet'] },
            { name: 'Emojis', icon: 'face-smile', icons: ['face-angry', 'face-cry', 'face-laugh', 'face-meh', 'face-melt', 'face-no-mouth', 'face-open-mouth', 'face-sad', 'face-smile', 'person', 'person-walking', 'person-wave', 'user', 'users'] },
            { name: 'Sports', icon: 'dice', icons: ['baseball', 'baseball-bat', 'basketball', 'dice', 'die-1', 'die-2', 'die-3', 'die-4', 'die-5', 'die-6', 'football', 'game-controller', 'hockey', 'joystick', 'soccer', 'tennis-ball'] },
            { name: 'Zodiac', icon: 'star', icons: ['aquarius', 'aries', 'cancer', 'capricorn', 'gemini', 'leo', 'libra', 'pisces', 'sagittarius', 'scorpio', 'taurus', 'virgo', 'star', 'star-half'] },
        ];
        const allIcons = [...new Set(categories.flatMap(cat => cat.icons))];
        return [{ name: 'All', icon: 'star', icons: allIcons }, ...categories];
    }, []);

    const displayedIcons = useMemo(() => {
        const selectedCategory = iconCategories.find(cat => cat.name === iconCategory);
        return selectedCategory ? selectedCategory.icons : [];
    }, [iconCategory, iconCategories]);

    const shapeOptions = useMemo(() => [
        { name: 'rectangle', value: 'rectangle', label: 'Rectangle', info: 'Standard hangtag shape' },
        { name: 'square', value: 'square', label: 'Square', info: '50x50mm fixed size' },
        { name: 'circle', value: 'circle', label: 'Circle', info: '50mm diameter' },
    ], []);

    const sizeOptions = useMemo(() => [
        { name: 'Small', width: 40, height: 70, label: 'Small\n40x70mm', info: 'Best for small items' },
        { name: 'Medium', width: 50, height: 90, label: 'Medium\n50x90mm', info: 'Standard size' },
        { name: 'Large', width: 60, height: 110, label: 'Large\n60x110mm', info: 'Best for large items' },
        { name: 'Fixed', width: 50, height: 50, label: 'Fixed\n50x50mm', info: 'For square and circle shapes' },
    ], []);

    const iconPositions = useMemo(() => [
        { value: 'none', label: 'No Icon', preview: 'Text' },
        { value: 'left', label: 'Left Icon', preview: '★ Text' },
        { value: 'both', label: 'Both Sides', preview: '★ Text ★' },
        { value: 'right', label: 'Right Icon', preview: 'Text ★' },
    ], []);

    const colorPalette = useMemo(() => [
        "#000000", "#FFFFFF", "#FF0000", "#FF3333", "#FF6666", "#FF9999", "#FFCCCC",
        "#FF4500", "#FF5E1A", "#FF7733", "#FF914D", "#FFAA66", "#FFD700", "#FFDF33",
        "#FFE566", "#FFEB99", "#FFF1CC", "#008000", "#1A8C1A", "#33A133", "#4DB54D",
        "#66C966", "#0000FF", "#3333FF", "#6666FF", "#9999FF", "#CCCCFF", "#800080",
        "#8C1A8C", "#A133A1", "#B54DB5", "#C966C9", "#FF69B4", "#FF7ABC", "#FF8CC4",
        "#FF9ECC", "#FFB0D4", "#333333", "#4D4D4D", "#666666", "#808080", "#999999",
        "#8B4513", "#A0522D", "#B5651D", "#C97828", "#DB8B33", "#00CED1", "#1AD4D7",
        "#33DADD", "#4DE0E3", "#66E6E9", "#4169E1", "#5277E5", "#6385E9", "#7493ED",
        "#85A1F1", "#32CD32", "#43D143", "#54D554", "#65D965", "#76DD76", "#2F4F4F",
        "#3B5A5A", "#476565", "#537070", "#5F7B7B", "#FFB6C1", "#FFDBC1", "#FFFACD",
        "#E6E6FA", "#D3F9D8",
    ], []);

    const scrollCategories = useCallback((direction) => {
        const container = categorySliderRef.current;
        if (container) {
            const scrollAmount = 200;
            const newPosition = direction === 'left' ? scrollPosition - scrollAmount : scrollPosition + scrollAmount;
            container.scrollTo({ left: newPosition, behavior: 'smooth' });
            setScrollPosition(newPosition);
        }
    }, [scrollPosition]);

    const scrollFontCategories = useCallback((direction) => {
        const container = fontCategorySliderRef.current;
        if (container) {
            const scrollAmount = 200;
            const newPosition = direction === 'left' ? fontScrollPosition - scrollAmount : fontScrollPosition + scrollAmount;
            container.scrollTo({ left: newPosition, behavior: 'smooth' });
            setFontScrollPosition(newPosition);
        }
    }, [fontScrollPosition]);

    const getFontSizeRange = useCallback(() => {
        let minSize, maxSize;
        if (design.shape !== 'rectangle' || design.size === 'small' || design.size === 'fixed') {
            minSize = 8;
            maxSize = 36;
        } else if (design.size === 'medium') {
            minSize = 10;
            maxSize = 48;
        } else {
            minSize = 12;
            maxSize = 60;
        }
        return { min: minSize, max: maxSize };
    }, [design.size, design.shape]);

    const calculateScaleFactor = useCallback(() => {
        const maxCanvasWidth = 300;
        const maxCanvasHeight = 400;
        const size = sizeOptions.find((s) => s.name.toLowerCase() === design.size) || sizeOptions.find((s) => s.name === 'Fixed');
        const { width, height } = size;

        const widthScale = maxCanvasWidth / width;
        const heightScale = maxCanvasHeight / height;
        let scale = Math.min(widthScale, heightScale);

        if (width === 60 && height === 110) { // Large
            scale *= 1.8; // Daha küçük bir ölçek faktörü
        } else if (width === 40 && height === 70) { // Small
            scale *= 2.0;
        } else if (width === 50 && height === 90) { // Medium
            scale *= 1.9;
        } else {
            scale *= 2.5; // Square ve Circle için
        }

        return Math.min(Math.max(scale, 1.5), 3.0); // Maksimum ölçeği 3.0 ile sınırladık
    }, [design.size, design.shape, sizeOptions]);

    const calculatePrice = useCallback(() => {
        if (!window.crd_ajax_obj || !window.crd_ajax_obj.settings) {
            console.error('Settings not found:', window.crd_ajax_obj);
            return { total: '0.00', perPiece: '0.00' };
        }

        const settings = window.crd_ajax_obj.settings;
        const safeNumber = (value) => (isNaN(Number(value)) ? 0 : Number(value));

        let basePrice = 0;
        if (design.shape !== 'rectangle' || design.size === 'fixed') {
            basePrice = safeNumber(settings.price_medium);
        } else if (design.size === 'small') {
            basePrice = safeNumber(settings.price_small);
        } else if (design.size === 'medium') {
            basePrice = safeNumber(settings.price_medium);
        } else {
            basePrice = safeNumber(settings.price_large);
        }

        switch (design.cardboardType) {
            case 'premium':
                basePrice += safeNumber(settings.premium_cardboard_fee);
                break;
            case 'recycled':
                basePrice += safeNumber(settings.recycled_cardboard_fee);
                break;
            default:
                break;
        }

        if (design.applicationMethod === 'string') {
            basePrice += safeNumber(settings.string_attachment_fee);
        } else if (design.applicationMethod === 'adhesive') {
            basePrice += safeNumber(settings.adhesive_back_fee);
        }

        if (design.extras.cornerRadius && design.shape === 'rectangle') {
            basePrice += safeNumber(settings.cornerRadius_fee);
        }
        if (design.extras.glossyFinish) {
            basePrice += safeNumber(settings.glossy_finish_fee);
        }
        if (design.extras.reinforced) {
            basePrice += safeNumber(settings.reinforced_fee);
        }

        if (!design.sameBack) {
            basePrice += safeNumber(settings.different_back_fee || 0.5);
        }

        const getDiscountRate = () => {
            const quantities = [500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 6000, 7000, 8000, 9000, 10000];
            let applicableDiscount = 0;
            for (let i = quantities.length - 1; i >= 0; i--) {
                if (design.quantity >= quantities[i]) {
                    const discountKey = `quantity_${quantities[i]}_discount`;
                    applicableDiscount = safeNumber(settings[discountKey]);
                    break;
                }
            }
            return applicableDiscount;
        };

        const discountRate = getDiscountRate();
        const discountMultiplier = (100 - discountRate) / 100;
        const finalPrice = basePrice * discountMultiplier;

        return {
            total: (design.quantity * finalPrice).toFixed(2),
            perPiece: finalPrice.toFixed(2),
            discountRate,
        };
    }, [design]);

    const captureCard = useCallback(async (side = 'A') => {
        try {
            await document.fonts.ready;
            const size = sizeOptions.find(s => s.name.toLowerCase() === design.size) || sizeOptions.find(s => s.name === 'Fixed');
            const scale = calculateScaleFactor();
            const captureWidth = Math.round(size.width * scale);
            const captureHeight = Math.round(size.height * scale);

            const container = document.createElement('div');
            container.style.cssText = `
                position: fixed;
                left: -9999px;
                top: -9999px;
                width: ${captureWidth}px;
                height: ${captureHeight}px;
                background-color: ${design.backgroundColor};
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
                border-radius: ${design.shape === 'circle' ? '50%' : design.extras.cornerRadius ? '8px' : '0'};
            `;

            const baseSpacing = Math.max(Math.min(size.width, size.height) * 0.08, 12);
            const config = {
                none: { padding: { v: size.height * 0.18, h: size.width * 0.18 } },
                single: { borderWidth: 1.5, outerPadding: baseSpacing, padding: { v: size.height * 0.15, h: size.width * 0.15 } },
            };
            const currentConfig = config[design.frameStyle];

            const cardBody = document.createElement('div');
            cardBody.style.cssText = `
                position: relative;
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                box-sizing: border-box;
                border-radius: ${design.shape === 'circle' ? '50%' : design.extras.cornerRadius ? '8px' : '0'};
            `;
            container.appendChild(cardBody);

            if (design.frameStyle === 'single') {
                const outerFrame = document.createElement('div');
                outerFrame.style.cssText = `
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    border: ${currentConfig.borderWidth}px solid ${design.textColor};
                    box-sizing: border-box;
                    border-radius: ${design.shape === 'circle' ? '50%' : design.extras.cornerRadius ? '8px' : '0'};
                `;
                cardBody.appendChild(outerFrame);
            }

            const contentWrapper = document.createElement('div');
            const contentPadding = design.frameStyle === 'single'
                ? currentConfig.outerPadding + currentConfig.borderWidth * 2
                : 0;

            contentWrapper.style.cssText = `
                position: relative;
                width: calc(100% - ${contentPadding * 2}px);
                height: calc(100% - ${contentPadding * 2}px);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: ${currentConfig.padding.v}px ${currentConfig.padding.h}px;
                box-sizing: border-box;
                z-index: 1;
                overflow: hidden;
            `;

            const textPosition = side === 'A' ? textPositionA : textPositionB;
            const image = side === 'A' ? imageA : imageB;
            const imagePosition = side === 'A' ? imagePositionA : imagePositionB;
            const textContent = side === 'A' ? (design.textA || 'Preview A') : (design.textB || 'Preview B');

            if (image) {
                const imgElement = document.createElement('img');
                imgElement.src = image;
                imgElement.style.cssText = `
                    max-width: 100%;
                    max-height: 100%;
                    object-fit: contain;
                    transform: translate(${imagePosition.x}px, ${imagePosition.y}px) scale(${imagePosition.scale});
                    position: absolute;
                    z-index: 0;
                `;
                contentWrapper.appendChild(imgElement);
            }

            const textContainer = document.createElement('div');
            textContainer.style.cssText = `
                display: flex;
                align-items: center;
                justify-content: center;
                width: 100%;
                color: ${design.textColor};
                font-family: '${design.font}', sans-serif;
                font-size: ${design.fontSize}px;
                line-height: 1.2;
                max-width: 100%;
                word-break: break-word;
                overflow-wrap: break-word;
                white-space: normal;
                transform: translate(${textPosition.x}px, ${textPosition.y}px) scale(${textPosition.scale});
                z-index: 1;
            `;

            const iconWidth = design.icon !== 'none' ? (design.iconPosition === 'both' ? design.fontSize * 1.5 : design.fontSize * 0.75) : 0;
            const iconGap = design.icon !== 'none' ? Math.round(design.fontSize * 0.3) : 0;
            const totalIconSpace = iconWidth + (iconGap * (design.iconPosition === 'both' ? 2 : 1));

            const contentInner = document.createElement('div');
            contentInner.style.cssText = `
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: ${iconGap}px;
                max-width: calc(100% - ${totalIconSpace}px);
                flex-wrap: wrap;
                word-break: break-word;
                overflow-wrap: break-word;
                white-space: normal;
                padding: 0 4px;
            `;

            const createIcon = async (iconName) => {
                const iconDiv = document.createElement('div');
                iconDiv.style.cssText = `
                    width: ${design.fontSize * 0.75}px;
                    height: ${design.fontSize * 0.75}px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    color: ${design.textColor};
                    flex-shrink: 0;
                `;
                const svg = await fetch('assets/sprite.svg').then(res => res.text());
                const doc = new DOMParser().parseFromString(svg, 'image/svg+xml');
                const symbol = doc.querySelector(`#${iconName}`);
                iconDiv.innerHTML = symbol ? `<svg viewBox="${symbol.getAttribute('viewBox')}">${symbol.innerHTML}</svg>` : '';
                return iconDiv;
            };

            if (design.icon !== 'none' && design.iconPosition !== 'none') {
                if (design.iconPosition === 'left' || design.iconPosition === 'both') {
                    const iconElement = await createIcon(design.icon);
                    contentInner.appendChild(iconElement);
                }

                const textSpan = document.createElement('span');
                textSpan.style.cssText = `
                    display: inline-block;
                    vertical-align: middle;
                    line-height: 1.2;
                    text-align: center;
                    white-space: normal;
                    word-break: break-word;
                    overflow-wrap: break-word;
                    hyphens: auto;
                    transform: translateY(0);
                    max-width: 100%;
                    min-width: 0;
                    flex: 1;
                `;
                textSpan.textContent = textContent;
                contentInner.appendChild(textSpan);

                if (design.iconPosition === 'right' || design.iconPosition === 'both') {
                    const iconElement = await createIcon(design.icon);
                    contentInner.appendChild(iconElement);
                }
            } else {
                const textSpan = document.createElement('span');
                textSpan.style.cssText = `
                    display: inline-block;
                    vertical-align: middle;
                    line-height: 1.2;
                    text-align: center;
                    white-space: normal;
                    word-break: break-word;
                    overflow-wrap: break-word;
                    hyphens: auto;
                    transform: translateY(0);
                    max-width: 100%;
                    min-width: 0;
                    flex: 1;
                `;
                textSpan.textContent = textContent;
                contentInner.appendChild(textSpan);
            }

            textContainer.appendChild(contentInner);
            contentWrapper.appendChild(textContainer);
            cardBody.appendChild(contentWrapper);

            if (design.applicationMethod === 'hole') {
                const hole = document.createElement('div');
                hole.style.cssText = `
                    position: absolute;
                    top: 5px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 5px;
                    height: 5px;
                    background-color: #000;
                    border-radius: 50%;
                `;
                cardBody.appendChild(hole);
            } else if (design.applicationMethod === 'string') {
                const string = document.createElement('div');
                string.style.cssText = `
                    position: absolute;
                    top: 0;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 2px;
                    height: 10px;
                    background-color: #555;
                `;
                cardBody.appendChild(string);
            }

            document.body.appendChild(container);
            await new Promise(res => setTimeout(res, 100));

            const canvas = await html2canvas(container, {
                scale: 4,
                backgroundColor: design.backgroundColor,
                width: captureWidth,
                height: captureHeight,
                imageRendering: 'pixelated',
            });

            document.body.removeChild(container);
            return canvas.toDataURL('image/png', 1.0);
        } catch (e) {
            console.error('captureCard error:', e);
            throw e;
        }
    }, [design, sizeOptions, calculateScaleFactor, textPositionA, textPositionB, imageA, imageB, imagePositionA, imagePositionB]);

    const addToCart = useCallback(async () => {
        if (loading || !design.textA.trim()) {
            alert('Please enter some text for Side A of your hangtag');
            return;
        }
        if (!design.sameBack && !design.textB.trim()) {
            alert('Please enter some text for Side B of your hangtag');
            return;
        }
        setLoading(true);
        try {
            const cardImageA = await captureCard('A');
            let cardImageB = cardImageA;
            if (!design.sameBack) {
                cardImageB = await captureCard('B');
            }

            if (!cardImageA || (!design.sameBack && !cardImageB)) {
                throw new Error('Failed to create hangtag image');
            }

            const priceInfo = calculatePrice();
            const designData = {
                ...design,
                imageDataA: cardImageA.split(',')[1],
                imageDataB: cardImageB.split(',')[1],
                created_at: new Date().toISOString(),
                created_by: 'cardgo',
                calculated_price: {
                    per_piece: parseFloat(priceInfo.perPiece),
                    total: parseFloat(priceInfo.total),
                },
            };

            const formData = new FormData();
            formData.append('action', 'add_to_cart_custom_card');
            formData.append('product_id', document.getElementById('card-designer-root').dataset.productId);
            formData.append('quantity', design.quantity);
            formData.append('card_design', JSON.stringify(designData));
            formData.append('custom_price', priceInfo.perPiece);
            formData.append('security', window.crd_ajax_obj.nonce);

            const response = await axios({
                method: 'POST',
                url: window.crd_ajax_obj.ajax_url,
                data: formData,
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.data.success) {
                window.location.href = response.data.data.cart_url;
            } else {
                throw new Error(response.data.data?.message || 'Error adding to cart');
            }
        } catch (error) {
            console.error('Add to cart error:', error);
            alert(error.message || 'An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [loading, design, captureCard, calculatePrice]);

    const calculateFrameOffsets = useCallback(() => {
        const size = sizeOptions.find(s => s.name.toLowerCase() === design.size) || sizeOptions.find(s => s.name === 'Fixed');
        const verticalPadding = Math.max(2, size.height * 0.02);
        const horizontalPadding = Math.max(4, size.width * 0.03);
        const verticalFrameOffset = design.frameStyle === 'single' ? Math.max(6, size.height * 0.04) : verticalPadding;
        const horizontalFrameOffset = design.frameStyle === 'single' ? Math.max(6, size.width * 0.04) : horizontalPadding;
        return { verticalPadding, horizontalPadding, verticalFrameOffset, horizontalFrameOffset };
    }, [design.frameStyle, design.size, design.shape, sizeOptions]);

    const handleImageUpload = (side, event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (side === 'A') {
                    setImageA(e.target.result);
                } else {
                    setImageB(e.target.result);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleShapeChange = (shape) => {
        setDesign((prev) => ({ ...prev, shape: shape.toLowerCase() }));
    };

    const renderCardContent = (side, showSizeIndicator = true) => {
        const content = side === 'A' ? (design.textA || 'Enter text for Side A') : (design.textB || 'Enter text for Side B');
        const {
            verticalPadding,
            horizontalPadding,
            verticalFrameOffset,
            horizontalFrameOffset,
        } = calculateFrameOffsets();
        const size = sizeOptions.find((s) => s.name.toLowerCase() === design.size) || sizeOptions.find((s) => s.name === 'Fixed');
        const scale = calculateScaleFactor();
        const containerClassName = `card-container ${design.frameStyle !== 'none' ? `with-${design.frameStyle}-frame` : ''}`;
        const textureClass = design.cardboardType === 'recycled' ? 'recycled-texture' : design.cardboardType === 'premium' ? 'premium-texture' : 'standard-texture';
        const isCircle = design.shape === 'circle';
        const borderRadius = isCircle ? '50%' : design.extras.cornerRadius ? '8px' : '0';
        const textPosition = side === 'A' ? textPositionA : textPositionB;
        const image = side === 'A' ? imageA : imageB;
        const imagePosition = side === 'A' ? imagePositionA : imagePositionB;

        const iconEl = design.icon !== 'none' ? (
            <span
                className="icon"
                style={{
                    width: `${Math.round(design.fontSize * 0.8)}px`,
                    height: `${Math.round(design.fontSize * 0.8)}px`,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    lineHeight: 1,
                    verticalAlign: 'middle',
                }}
            >
            <Icon name={design.icon} color={design.textColor} />
        </span>
        ) : null;

        return (
            <div className={containerClassName} style={{ borderRadius, position: 'relative' }}>
                {design.frameStyle === 'single' && (
                    <div
                        className="outer-frame"
                        style={{
                            borderColor: design.textColor,
                            top: `0px`,
                            left: `0px`,
                            right: `0px`,
                            bottom: `0px`,
                            border: `2px solid`,
                            borderRadius,
                            position: 'absolute',
                            boxSizing: 'border-box',
                        }}
                    />
                )}
                <div
                    className={`card-content-wrapper ${design.frameStyle !== 'none' ? `${design.frameStyle}-frame` : ''} ${textureClass}`}
                    style={{
                        background: design.backgroundColor,
                        color: design.textColor,
                        fontFamily: design.font,
                        width: '100%',
                        height: '100%',
                        boxSizing: 'border-box',
                        borderRadius,
                        position: 'relative',
                        zIndex: 1,
                        overflow: 'visible', // Kesilme sorununu önlemek için
                    }}
                >
                    {image && (
                        <img
                            src={image}
                            alt={`Hangtag Image ${side}`}
                            className="card-image"
                            style={{
                                maxWidth: '100%',
                                maxHeight: '100%',
                                objectFit: 'contain',
                                transform: `translate(${imagePosition.x}px, ${imagePosition.y}px) scale(${imagePosition.scale})`,
                                position: 'absolute',
                                zIndex: 0,
                            }}
                        />
                    )}
                    <div
                        className="card-text-display"
                        style={{
                            fontSize: `${Math.round(design.fontSize)}px`,
                            display: 'flex',
                            flexDirection: 'row',
                            flexWrap: 'wrap',
                            padding: design.frameStyle === 'single'
                                ? `${verticalFrameOffset}px ${horizontalFrameOffset}px`
                                : `${verticalPadding}px ${horizontalPadding}px`,
                            margin: '0',
                            lineHeight: 1.2,
                            boxSizing: 'border-box',
                            width: '100%',
                            height: '100%',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transform: `translate(${textPosition.x}px, ${textPosition.y}px) scale(${textPosition.scale})`,
                            transformOrigin: 'center',
                            zIndex: 1,
                        }}
                    >
                    <span
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: `${Math.max(2, Math.round(design.fontSize * 0.2))}px`,
                            textAlign: 'center',
                            maxWidth: '100%',
                            maxHeight: '100%',
                            overflow: 'hidden',
                            whiteSpace: 'normal',
                            lineHeight: 1.2,
                        }}
                    >
                        {(design.iconPosition === 'left' || design.iconPosition === 'both') && iconEl}
                        <span
                            className="card-content"
                            style={{
                                display: 'inline-block',
                                maxWidth: '100%',
                                maxHeight: '100%',
                                wordBreak: 'break-word',
                                overflowWrap: 'break-word',
                                textAlign: 'center',
                                whiteSpace: 'normal',
                                lineHeight: 1.2,
                            }}
                        >
                            {content}
                        </span>
                        {(design.iconPosition === 'right' || design.iconPosition === 'both') && iconEl}
                    </span>
                    </div>
                </div>
                {showSizeIndicator && (
                    <div className="size-indicator" style={{ position: 'absolute', bottom: '-20px', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center' }}>
                        <div className="width-indicator" style={{ marginRight: '5px' }}>{`${size.width}mm`}</div>
                        <div className="dimension-line width-line" style={{ width: `${size.width * scale / 2}px`, borderTop: '1px dashed #000' }} />
                        <div className="height-indicator" style={{ marginLeft: '5px' }}>{`${size.height}mm`}</div>
                    </div>
                )}
                {design.applicationMethod === 'hole' && (
                    <div
                        className="punch-hole"
                        style={{
                            position: 'absolute',
                            top: '5px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '5px',
                            height: '5px',
                            backgroundColor: '#000',
                            borderRadius: '50%',
                        }}
                    />
                )}
                {design.applicationMethod === 'string' && (
                    <div
                        className="string-attachment"
                        style={{
                            position: 'absolute',
                            top: '0',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '2px',
                            height: '10px',
                            backgroundColor: '#555',
                        }}
                    />
                )}
            </div>
        );
    };

    useEffect(() => {
        if (design.iconPosition === 'none') {
            setDesign(prev => ({ ...prev, icon: 'none' }));
        }
    }, [design.iconPosition]);

    useEffect(() => {
        if (design.icon !== 'none' && design.iconPosition === 'none') {
            setDesign(prev => ({ ...prev, iconPosition: 'left' }));
        }
    }, [design.icon, design.iconPosition]);

    useEffect(() => {
        if (cardARef.current) {
            const wrapper = cardARef.current.querySelector('.card-content-wrapper');
            if (wrapper) {
                wrapper.style.background = design.backgroundColor;
            }
        }
        if (cardBRef.current) {
            const wrapper = cardBRef.current.querySelector('.card-content-wrapper');
            if (wrapper) {
                wrapper.style.background = design.backgroundColor;
            }
        }
    }, [design.backgroundColor]);

    const prices = useMemo(() => calculatePrice(), [calculatePrice]);

    const adjustTextPosition = (side, action) => {
        const step = 5;
        const scaleStep = 0.1;
        const setter = side === 'A' ? setTextPositionA : setTextPositionB;
        setter((prev) => {
            switch (action) {
                case 'zoomIn':
                    return { ...prev, scale: Math.min(prev.scale + scaleStep, 2.0) };
                case 'zoomOut':
                    return { ...prev, scale: Math.max(prev.scale - scaleStep, 0.5) };
                case 'up':
                    return { ...prev, y: prev.y - step };
                case 'down':
                    return { ...prev, y: prev.y + step };
                case 'left':
                    return { ...prev, x: prev.x - step };
                case 'right':
                    return { ...prev, x: prev.x + step };
                case 'center':
                    return { x: 0, y: 0, scale: 1 };
                default:
                    return prev;
            }
        });
    };

    const adjustImagePosition = (side, action) => {
        const step = 5;
        const scaleStep = 0.1;
        const setter = side === 'A' ? setImagePositionA : setImagePositionB;
        setter((prev) => {
            switch (action) {
                case 'zoomIn':
                    return { ...prev, scale: Math.min(prev.scale + scaleStep, 2.0) };
                case 'zoomOut':
                    return { ...prev, scale: Math.max(prev.scale - scaleStep, 0.5) };
                case 'up':
                    return { ...prev, y: prev.y - step };
                case 'down':
                    return { ...prev, y: prev.y + step };
                case 'left':
                    return { ...prev, x: prev.x - step };
                case 'right':
                    return { ...prev, x: prev.x + step };
                case 'center':
                    return { x: 0, y: 0, scale: 1 };
                default:
                    return prev;
            }
        });
    };

    const renderTextControls = (side) => (
        <div className="text-position-controls">
            <div className="group-title">{`Text Position & Size (Side ${side})`}</div>
            <div className="text-position-buttons">
                {[
                    { action: 'zoomIn', icon: '+' },
                    { action: 'up', icon: '↑' },
                    { action: 'zoomOut', icon: '−' },
                    { action: 'left', icon: '←' },
                    { action: 'center', icon: '↹' },
                    { action: 'right', icon: '→' },
                    { action: 'down', icon: '↓' },
                ].map((btn) => (
                    <button
                        key={btn.action}
                        className="position-button"
                        onClick={() => adjustTextPosition(side, btn.action)}
                    >
                        <span className="position-icon">{btn.icon}</span>
                    </button>
                ))}
            </div>
        </div>
    );

    const renderImageControls = (side) => (
        <div className="image-position-controls">
            <div className="group-title">{`Image Position & Size (Side ${side})`}</div>
            <div className="image-position-buttons">
                {[
                    { action: 'zoomIn', icon: '+' },
                    { action: 'up', icon: '↑' },
                    { action: 'zoomOut', icon: '−' },
                    { action: 'left', icon: '←' },
                    { action: 'center', icon: '↹' },
                    { action: 'right', icon: '→' },
                    { action: 'down', icon: '↓' },
                ].map((btn) => (
                    <button
                        key={btn.action}
                        className="position-button"
                        onClick={() => adjustImagePosition(side, btn.action)}
                        disabled={side === 'A' ? !imageA : !imageB}
                    >
                        <span className="position-icon">{btn.icon}</span>
                    </button>
                ))}
            </div>
        </div>
    );

    const calculateContrastRatio = (color1, color2) => {
        const hexToRgb = (hex) => {
            const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
            hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result
                ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
                : { r: 0, g: 0, b: 0 };
        };

        const rgb1 = hexToRgb(color1);
        const rgb2 = hexToRgb(color2);

        const rgbToXyz = (r, g, b) => {
            r = r / 255;
            g = g / 255;
            b = b / 255;
            r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
            g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
            b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
            r = r * 100;
            g = g * 100;
            b = b * 100;
            const x = r * 0.4124 + g * 0.3576 + b * 0.1805;
            const y = r * 0.2126 + g * 0.7152 + b * 0.0722;
            const z = r * 0.0193 + g * 0.1192 + b * 0.9505;
            return [x, y, z];
        };

        const [x1, y1, z1] = rgbToXyz(rgb1.r, rgb1.g, rgb1.b);
        const [x2, y2, z2] = rgbToXyz(rgb2.r, rgb2.g, rgb2.b);

        const getBrightness = (rgb) => (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
        const brightness1 = getBrightness(rgb1);
        const brightness2 = getBrightness(rgb2);
        const brightnessDiff = Math.abs(brightness1 - brightness2);

        return {
            brightnessDiff,
            isLowContrast: brightnessDiff < 50,
            needsWarning: brightnessDiff < 50,
        };
    };

    const checkColors = (newTextColor, newBgColor, setColorCallback, colorToSet) => {
        if (newTextColor === newBgColor) {
            setOverlay({
                show: true,
                message: 'Text color and background color cannot be the same!',
                onConfirm: null,
            });
            return false;
        }

        const contrast = calculateContrastRatio(newTextColor, newBgColor);
        if (contrast.needsWarning) {
            setOverlay({
                show: true,
                message: 'Warning: The selected colors are too similar and may be hard to read. Do you want to proceed anyway?',
                onConfirm: () => setColorCallback({ ...design, textColor: newTextColor, backgroundColor: newBgColor }),
            });
            return false;
        }
        return true;
    };

    return (
        <div className="card-designer-wrapper">
            <div className="designer-container">
                {/* Kontrol Paneli */}
                <div className="designer-controls">
                    {/* Şekil Seçimi */}
                    <div className="control-group">
                        <div className="group-title">
                            Shape
                            <span className="help-icon">
                                ?
                                <span className="tooltip">Select the shape of your hangtag.</span>
                            </span>
                        </div>
                        <div className="shape-options">
                            {shapeOptions.map((shape) => (
                                <div
                                    key={shape.name}
                                    className={`shape-option ${design.shape === shape.value ? 'selected' : ''}`}
                                    onClick={() => handleShapeChange(shape.value)}
                                >
                                    <div className="shape-preview">
                                        <div
                                            className={`shape-box ${shape.value}`}
                                            style={{
                                                borderRadius: shape.value === 'circle' ? '50%' : '0',
                                                width: shape.value === 'rectangle' ? '60px' : '50px',
                                                height: shape.value === 'rectangle' ? '80px' : '50px',
                                            }}
                                        />
                                    </div>
                                    <div className="shape-details">
                                        <div className="shape-name">{shape.label}</div>
                                        <div className="shape-info">{shape.info}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Boyut Seçimi */}
                    {design.shape === 'rectangle' && (
                        <div className="control-group">
                            <div className="group-title">
                                Size
                                <span className="help-icon">
                                    ?
                                    <span className="tooltip">Select the size of your hangtag.</span>
                                </span>
                            </div>
                            <div className="size-options">
                                {sizeOptions
                                    .filter((size) => size.name !== 'Fixed')
                                    .map((size) => (
                                        <div
                                            key={size.name}
                                            className={`size-option ${design.size === size.name.toLowerCase() ? 'selected' : ''}`}
                                            onClick={() => setDesign((prev) => ({ ...prev, size: size.name.toLowerCase() }))}
                                            data-size={size.name.toLowerCase()}
                                        >
                                            <div className="size-preview">
                                                <div className="size-box" />
                                            </div>
                                            <div className="size-details">
                                                <div className="size-name">{size.name}</div>
                                                <div className="size-dimensions">{`${size.width}x${size.height}mm`}</div>
                                                <div className="size-info">{size.info}</div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}

                    {/* Arka Yüz Seçenekleri */}
                    <div className="control-group">
                        <div className="group-title">
                            Back Side
                            <span className="help-icon">
                                ?
                                <span className="tooltip">Choose whether the back side is the same as the front or different.</span>
                            </span>
                        </div>
                        <div className="back-options">
                            <button
                                className={`back-button ${design.sameBack ? 'selected' : ''}`}
                                onClick={() => setDesign((prev) => ({ ...prev, sameBack: true }))}
                            >
                                Same as Front
                            </button>
                            <button
                                className={`back-button ${!design.sameBack ? 'selected' : ''}`}
                                onClick={() => setDesign((prev) => ({ ...prev, sameBack: false }))}
                            >
                                Different
                            </button>
                        </div>
                    </div>

                    {/* Metin Girişi (Side A) */}
                    <div className="control-group">
                        <div className="group-title">
                            {design.sameBack ? 'Hangtag Text' : 'Hangtag Text (Side A)'}
                            <span className="help-icon">
                                ?
                                <span className="tooltip">Enter the text for Side A of your hangtag.</span>
                            </span>
                        </div>
                        <div className="text-control-wrapper">
                            <textarea
                                value={design.textA}
                                onChange={(e) => setDesign((prev) => ({ ...prev, textA: e.target.value }))}
                                className="card-text-input"
                                placeholder="Enter text for Side A"
                                maxLength={200}
                                rows={4}
                            />
                            <div className="designer-controls">
                                {renderTextControls('A')}
                            </div>
                        </div>
                        <div className="image-upload-wrapper">
                            <label>Upload Image (Side A)</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload('A', e)}
                                className="image-upload-input"
                            />
                            {imageA && renderImageControls('A')}
                        </div>
                    </div>

                    {/* Metin Girişi (Side B) - Same Back Seçili Değilse */}
                    {!design.sameBack && (
                        <div className="control-group">
                            <div className="group-title">
                                Hangtag Text (Side B)
                                <span className="help-icon">
                                    ?
                                    <span className="tooltip">Enter the text for Side B of your hangtag.</span>
                                </span>
                            </div>
                            <div className="text-control-wrapper">
                                <textarea
                                    value={design.textB}
                                    onChange={(e) => setDesign((prev) => ({ ...prev, textB: e.target.value }))}
                                    className="card-text-input"
                                    placeholder="Enter text for Side B"
                                    maxLength={200}
                                    rows={4}
                                />
                                <div className="designer-controls">
                                    {renderTextControls('B')}
                                </div>
                            </div>
                            <div className="image-upload-wrapper">
                                <label>Upload Image (Side B)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImageUpload('B', e)}
                                    className="image-upload-input"
                                />
                                {imageB && renderImageControls('B')}
                            </div>
                        </div>
                    )}

                    {/* Materyal Seçimi */}
                    <div className="control-group">
                        <div className="group-title">
                            Material
                            <span className="help-icon">
                                ?
                                <span className="tooltip">Choose the material for your hangtag.</span>
                            </span>
                        </div>
                        <div className="material-options">
                            {materialOptions.map((material) => (
                                <button
                                    key={material.name}
                                    className={`material-button ${design.cardboardType === material.name ? 'selected' : ''}`}
                                    onClick={() => setDesign((prev) => ({ ...prev, cardboardType: material.name }))}
                                >
                                    <div className="material-icon" />
                                    <div className="material-info">
                                        <div className="material-title">{material.label}</div>
                                        <div className="material-desc">{material.description}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Uygulama Yöntemi */}
                    <div className="control-group">
                        <div className="group-title">
                            Application Method
                            <span className="help-icon">
                                ?
                                <span className="tooltip">Choose how the hangtag will be attached.</span>
                            </span>
                        </div>
                        <div className="application-options">
                            {applicationMethods.map((method) => (
                                <button
                                    key={method.name}
                                    className={`application-button ${design.applicationMethod === method.name ? 'selected' : ''}`}
                                    onClick={() => setDesign((prev) => ({ ...prev, applicationMethod: method.name }))}
                                >
                                    <div className="method-icon">{method.icon}</div>
                                    <div className="application-info">
                                        <div className="application-title">{method.label}</div>
                                        <div className="application-desc">{method.description}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Ekstra Özellikler */}
                    <div className="control-group">
                        <div className="group-title">
                            Extras
                            <span className="help-icon">
                                ?
                                <span className="tooltip">Add optional features to your hangtag.</span>
                            </span>
                        </div>
                        <div className="extras-options">
                            {extraOptions.map((extra) => (
                                <button
                                    key={extra.name}
                                    className={`extra-option-button ${design.extras[extra.name] ? 'selected' : ''}`}
                                    onClick={() =>
                                        setDesign((prev) => ({
                                            ...prev,
                                            extras: { ...prev.extras, [extra.name]: !prev.extras[extra.name] },
                                        }))
                                    }
                                    disabled={extra.name === 'cornerRadius' && design.shape === 'circle'}
                                >
                                    <div className="extra-info">
                                        <div className="extra-title">{extra.label}</div>
                                        <div className="extra-desc">{extra.description}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Çerçeve Stili */}
                    <div className="control-group">
                        <div className="group-title">
                            Frame Style
                            <span className="help-icon">
                                ?
                                <span className="tooltip">Choose a frame style for your hangtag.</span>
                            </span>
                        </div>
                        <div className="frame-style-buttons">
                            {frameStyles.map((style) => (
                                <button
                                    key={style.name}
                                    className={`frame-button ${design.frameStyle === style.name ? 'selected' : ''}`}
                                    onClick={() => setDesign((prev) => ({ ...prev, frameStyle: style.name }))}
                                >
                                    <div className={`frame-preview ${style.name}-frame`}>
                                        <div className="preview-content" />
                                    </div>
                                    <span>{style.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Kanvas Alanı */}
                <div className="designer-canvas">
                    <div className="preview-header">
                        <div className="dimensions">
                            <span className="actual-size">
                                {design.shape === 'rectangle'
                                    ? `${sizeOptions.find((s) => s.name.toLowerCase() === design.size)?.width}x${sizeOptions.find((s) => s.name.toLowerCase() === design.size)?.height}mm`
                                    : design.shape === 'square'
                                        ? '50x50mm'
                                        : '50mm diameter'}
                            </span>
                        </div>
                    </div>
                    <div className="canvas-frame">
                        <div className="card-sides">
                            <div className="card-side">
                                {!design.sameBack && <div className="side-label">Side A</div>}
                                <div
                                    ref={cardARef}
                                    className={`card-preview ${design.frameStyle}-frame ${design.cardboardType}-texture`}
                                    style={{
                                        width: Math.min(
                                            (sizeOptions.find((s) => s.name.toLowerCase() === design.size)?.width || 50) * calculateScaleFactor(),
                                            300
                                        ) + 'px',
                                        height: Math.min(
                                            (sizeOptions.find((s) => s.name.toLowerCase() === design.size)?.height || 50) * calculateScaleFactor(),
                                            400
                                        ) + 'px',
                                        maxWidth: '300px',
                                        maxHeight: '400px',
                                        borderRadius: design.shape === 'circle' ? '50%' : design.extras.cornerRadius ? '8px' : '0',
                                        backgroundColor: design.backgroundColor,
                                        position: 'relative',
                                        overflow: 'hidden',
                                        transform: 'translate(0, 0)',
                                        margin: 'auto',
                                    }}
                                >
                                    {renderCardContent('A')}
                                </div>
                            </div>
                            {!design.sameBack && (
                                <div className="card-side">
                                    <div className="side-label">Side B</div>
                                    Copy
                                    <div
                                        ref={cardBRef}
                                        className={`card-preview ${design.frameStyle}-frame ${design.cardboardType}-texture`}
                                        style={{
                                            width: Math.min(
                                                (sizeOptions.find((s) => s.name.toLowerCase() === design.size)?.width || 50) * calculateScaleFactor(),
                                                300
                                            ) + 'px',
                                            height: Math.min(
                                                (sizeOptions.find((s) => s.name.toLowerCase() === design.size)?.height || 50) * calculateScaleFactor(),
                                                400
                                            ) + 'px',
                                            maxWidth: '300px',
                                            maxHeight: '400px',
                                            borderRadius: design.shape === 'circle' ? '50%' : design.extras.cornerRadius ? '8px' : '0',
                                            backgroundColor: design.backgroundColor,
                                            position: 'relative',
                                            overflow: 'hidden',
                                            transform: 'translate(0, 0)',
                                            margin: 'auto',
                                        }}
                                    >
                                        {renderCardContent('B')}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="order-section">
                        <div className="quantity-selector">
                            <label htmlFor="quantity">Quantity</label>
                            <select
                                id="quantity"
                                value={design.quantity}
                                onChange={(e) => setDesign((prev) => ({ ...prev, quantity: Number(e.target.value) }))}
                                disabled={loading}
                            >
                                {[500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 6000, 7000, 8000, 9000, 10000].map(
                                    (q) => (
                                        <option key={q} value={q}>
                                            {q} pieces
                                        </option>
                                    )
                                )}
                            </select>
                        </div>
                        <div className="price-info">
                            <div className="total-price">
                                <span>Total Price:</span>
                                <span className="amount">${prices.total}</span>
                            </div>
                            <div className="price-per-piece">${prices.perPiece} per piece</div>
                        </div>
                        <button
                            className={`add-to-cart-button ${loading ? 'loading' : ''}`}
                            onClick={addToCart}
                            disabled={loading || !design.textA.trim() || (!design.sameBack && !design.textB.trim())}
                        >
                            {loading ? 'Adding to Cart...' : 'Add to Cart'}
                        </button>
                    </div>
                </div>
            </div>
            {overlay.show && (
                <div className="overlay">
                    <div className="overlay-content">
                        <p>{overlay.message}</p>
                        <div className="overlay-buttons">
                            {overlay.onConfirm ? (
                                <>
                                    <button onClick={() => { overlay.onConfirm(); setOverlay({ show: false, message: '', onConfirm: null }); }}>
                                        Yes
                                    </button>
                                    <button onClick={() => setOverlay({ show: false, message: '', onConfirm: null })}>
                                        No
                                    </button>
                                </>
                            ) : (
                                <button onClick={() => setOverlay({ show: false, message: '', onConfirm: null })}>
                                    OK
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
