

export const sleep = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
};


export const scrollRefToOwnBottom = ref => {
    // General scroll to element function
    if (!ref || !ref.current) return;
    (ref.current as HTMLDivElement).scrollTo({
        top: ref.current.scrollHeight,
        left: 0
    });
};

export const scrollRefToOwnTop = ref => {
    // General scroll to element function
    if (!ref || !ref.current) return;
    (ref.current as HTMLDivElement).scrollTo({
        top: 0,
        left: 0
    });
};

export const scrollToRef = (ref, offset = 0) => {
    // = ref.current.offsetTop
    // console.log("SCROLL CALLED", ref);
    if (ref && ref.current) window.scrollTo(0, ref.current.offsetTop + offset);
};

export const scrollToTopOfPage = () => window.scrollTo(0, 0);

const arrayMoveMutate = (array, from, to) => {
    array.splice(to < 0 ? array.length + to : to, 0, array.splice(from, 1)[0]);
};

const arrayMove = (array, from, to) => {
    console.log(array, from, to);
    array = array.slice();
    arrayMoveMutate(array, from, to);
    return array;
};

export const arrayMoveSetWeights = (array: any[], from: number, to: number) => {
    return arrayMove(array, from, to).map((item, index) => ({
        ...item,
        ...{ weight: index + 1 }
    }));
};

/**
 * DO NOT EXPECT THIS TO BE SECURE. It will not remove JS. This is a helper function for rendering HTML-like strings stripped of styling only
 */
export const dangerouslyStripHTMLTags = (html: string) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    const text = div.textContent || div.innerText || "";
    return text;
};

export const getCurrentTime = (): string => {
    let todayDate = new Date();
    let hours = todayDate.getHours();
    let minutes = todayDate.getMinutes();
    let format = "AM";
    let finalMinutes = "";
    if (hours > 11) {
        format = "PM";
    }
    if (hours > 12) {
        hours = hours - 12;
    }
    if (hours == 0) {
        hours = 12;
    }
    if (minutes < 10) {
        finalMinutes = "0" + minutes;
    } else {
        finalMinutes = minutes.toString();
    }

    return `${hours}:${finalMinutes} ${format}`;
};

export const observeElement = (
    element: HTMLElement,
    setter: (isInView: boolean) => void,
    threshold = .01,
) => {
    const observer = new IntersectionObserver(onChange);
    observer.observe(element);
    function onChange(changes, observer) {
        changes.forEach(change => {
            console.log("CHANGE", change.intersectionRatio, threshold);
            if (change.intersectionRatio > 0) {
                observer.unobserve(change.target);
                setter(true);
            }
        });
    }
};
