const searchParams = new URLSearchParams(window.location.search);

let currentLanguage = searchParams.get('lang')

if (!currentLanguage) {
    currentLanguage = (window.navigator.userLanguage || window.navigator.language).substr(0, 2);
}

document.addEventListener('DOMContentLoaded', async function () {
    const filePath = `./public/i18n/${currentLanguage}.json`; // Путь к вашему JSON-файлу

    try {
        const jsonLanguage = await loadJSON(filePath);
        translate(jsonLanguage);
    } catch (error) {
        // Можно подставить ключи из data-i18n, если вдруг не найден файлс переводами
        //  я же предпочел просто установить английский т.к. уверечн, что он есть
        try {
            currentLanguage = 'en'
            const jsonLanguage = await loadJSON(`./public/i18n/${currentLanguage}.json`);
            translate(jsonLanguage);
        } catch (error) {
            console.error(error)
        }
    } finally {
        document.querySelector('#preloader').classList.add('hidden');
    }

    const handleClickButtonClose = () => {
        document.querySelector('#arta').classList.add('hidden')
    };

    document.querySelector('#artaClose').addEventListener('click', handleClickButtonClose);


    //////////////////////////////////////////////////////////////////////////////
    //////// Обработчики для выбора нужной цены, но так никто не делает через HTML
    //////// Просто показываю, что таможно реализовать и таким способом
    //////////////////////////////////////////////////////////////////////////////
    const priceNode = document.querySelector(".price");
    const handleClickPrice = (event) => {
        const priceItem = event.target.closest('.price__item');

        if (priceItem) {
            const priceItemId = priceItem.getAttribute('data-id');

            const priceItemNodes = priceNode.querySelectorAll('.price__item');
            for (const priceItemNode of priceItemNodes) {
                // console.log(priceItemNode);
                priceItemNode.classList.remove('price__item--active')
                const priceItemNodeId = priceItemNode.getAttribute('data-id');
                if (priceItemId === priceItemNodeId) {
                    priceItemNode.classList.add('price__item--active')
                }
            }
        }

        const priceNextStep = event.target.closest('.price__nextStep');
        // Кнопка продолжить
        if (priceNextStep) {
            const activePrice = priceNode.querySelector('.price__item--active');
            // здесь еще валидацию провести нужно, что там точно html
            const activePriceHref = activePrice.getAttribute('data-href');
            window.location.href = activePriceHref;
        }
    };

    priceNode.addEventListener('click', handleClickPrice)
});


function translate(json) {
    const elements = document.querySelectorAll('[data-i18n]');

    elements.forEach((element, index) => {
        const key = element.getAttribute('data-i18n');
        let text = json[key]

        const variables = text.match(/{(.*?)}}/g);
        if (variables) {

            variables.forEach((variable) => {
                Object.entries(element.dataset).filter(([key, value]) => {
                    if (`{{${key}}}` === variable) {
                        try {
                            text = text.replace(`${variable}`, new Function(`return (${value})`)());
                        } catch (error) {
                            text = text.replace(`${variable}`, value);
                        }
                    }
                })
            });
        }

        element.innerHTML = text;
    });
}

// Функция для загрузки JSON-файла
async function loadJSON(filePath) {
    const response = await fetch(filePath);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
}
