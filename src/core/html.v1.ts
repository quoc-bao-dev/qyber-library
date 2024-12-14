/**
 * Create an HTML element using a template literal.
 * @param strings - Template literal strings.
 * @param values - Dynamic values interpolated into the template.
 * @returns An HTML element.
 */

/**
 * Create an HTML element using a template literal.
 * @param strings - Template literal strings.
 * @param values - Dynamic values interpolated into the template.
 * @returns An HTML element.
 */
export function html(
    strings: TemplateStringsArray,
    ...values: any[]
): HTMLElement {
    /**
     * Escape the given string from HTML special characters.
     * @param str - The string to be escaped.
     * @returns The escaped string.
     */
    const escapeHTML = (str: string): string =>
        str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');

    const template = strings.reduce((acc, str, i) => {
        const value = values[i];
        if (
            value === null ||
            value === undefined ||
            value === false ||
            value === ''
        ) {
            return acc + str;
        }

        if (typeof value === 'function') {
            return acc + str + `__callback${i}__`;
        }

        if (value instanceof HTMLElement) {
            return acc + str + `<template id="__component${i}__"></template>`;
        }

        if (
            Array.isArray(value) &&
            value.every((v) => v instanceof HTMLElement)
        ) {
            return (
                acc + str + `<template id="__arr_component${i}__"></template>`
            );
        }

        return acc + str + escapeHTML(String(value));
    }, '');

    const container = document.createElement('div');
    container.innerHTML = template.trim();

    if (container.children.length !== 1) {
        console.error(
            new Error('Template must contain a single root element.')
        );
        return document.createElement('');
    }

    const element = container.firstElementChild as HTMLElement;

    // Iterate over the values and process each based on its type
    values.forEach((value, index) => {
        // If the value is a function, assign it to the corresponding attribute
        if (typeof value === 'function') {
            const placeholder = `__callback${index}__`;
            const targetElement = Array.from(
                container.querySelectorAll('*')
            ).find((el) =>
                Array.from(el.attributes).some(
                    (attr) => attr.value === placeholder
                )
            );

            if (targetElement) {
                const attrName = Array.from(targetElement.attributes).find(
                    (attr) => attr.value === placeholder
                )?.name;

                if (attrName) {
                    targetElement.removeAttribute(attrName);
                    (targetElement as any)[attrName] = value;
                }
            }
            // If the value is an HTMLElement, replace the corresponding placeholder
        } else if (value instanceof HTMLElement) {
            const placeholder = `__component${index}__`;
            const targetElement = element.querySelector(
                `template[id="${placeholder}"]`
            );
            if (targetElement) {
                targetElement.replaceWith(value);
            }
            // If the value is an array of HTMLElements, replace the corresponding placeholder with clones of the elements
        } else if (
            Array.isArray(value) &&
            value.every((v) => v instanceof HTMLElement)
        ) {
            const placeholder = `__arr_component${index}__`;
            const targetElement = element.querySelector(
                `template[id="${placeholder}"]`
            );
            if (targetElement) {
                targetElement.replaceWith(
                    ...value.map((v) => v.cloneNode(true))
                );
            }
        }
    });

    return element;
}
