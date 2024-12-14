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
    const escapeHTML = (str: string): string =>
        str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');

    // Kết hợp strings và values để tạo HTML string
    const template = strings.reduce((acc, str, i) => {
        const value = values[i];
        if (
            value === null ||
            value === undefined ||
            value === false ||
            value === ''
        ) {
            return acc + str; // Bỏ qua các giá trị không hợp lệ
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

        // Escape các giá trị chuỗi
        return acc + str + escapeHTML(String(value));
    }, '');

    // Tạo container DOM để parse HTML
    const container = document.createElement('div');
    container.innerHTML = template.trim();

    // Đảm bảo template chỉ có một root element
    if (container.children.length !== 1) {
        console.error(
            new Error('Template must contain a single root element.')
        );
        return document.createElement('');
    }

    const element = container.firstElementChild as HTMLElement;

    // Xử lý các placeholders trong DOM
    values.forEach((value, index) => {
        if (typeof value === 'function') {
            // Gán callback cho các placeholder
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
                    (targetElement as any)[attrName] = value; // Gán trực tiếp callback
                }
            }
        } else if (value instanceof HTMLElement) {
            // Thay thế các `template` bằng component
            const placeholder = `__component${index}__`;
            const targetElement = element.querySelector(
                `template[id="${placeholder}"]`
            );
            if (targetElement) {
                targetElement.replaceWith(value);
            }
        } else if (
            Array.isArray(value) &&
            value.every((v) => v instanceof HTMLElement)
        ) {
            // Thay thế mảng component
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
