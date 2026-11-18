import {useState, useEffect, useMemo, useCallback} from 'react';


const getDeviceInfo = () => {
    const ua = navigator.userAgent;
    const isAndroid = /Android/i.test(ua);
    const isIOS = /iPad|iPhone|iPod/.test(ua);
    const isIpad = /iPad/.test(ua);
    const isMobile = isAndroid || isIOS;
    const isTablet = isIpad || (isAndroid && !/Mobile/.test(ua));

    return {isAndroid, isIOS, isIpad, isMobile, isTablet};
}


export const useDevice = () => {
    const [dimensions, setDimensions] = useState(() => ({
        width: window.innerWidth,
        height: window.innerHeight
    }));

    const handleResize = useCallback(() => {
        setDimensions({
            width: window.innerWidth,
            height: window.innerHeight
        });
    }, []);

    useEffect(() => {
        window.addEventListener('resize', handleResize, {passive: true});
        return () => window.removeEventListener('resize', handleResize);
    }, [handleResize])

    const deviceInfo = useMemo(() => {
        const {width, height} = dimensions;
        const {isAndroid, isIOS, isIpad, isMobile, isTablet} = getDeviceInfo();
        const touchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

        return {
            isMobile,
            isAndroid,
            isIOS,
            isIpad,
            isTablet,
            isDesktop: !isMobile && !isTablet,
            orientation: width > height ? 'landscape' : 'portrait',
            isLandscape: width > height,
            isPortrait: height > width,
            aspectRatio: width / height,
            pixelRatio: window.devicePixelRatio || 1,
            touchSupport,
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            width,
            height,
            // Convenience flags for responsive UI
            isTouchDevice: touchSupport,
            isSmallScreen: width < 768,
            isMediumScreen: width >= 768 && width < 1024,
        };
    }, [dimensions]);

    return deviceInfo;
};