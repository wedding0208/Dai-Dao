import { video } from './video.js';
import { image } from './image.js';
import { audio } from './audio.js';
import { progress } from './progress.js';
import { util } from '../../common/util.js';
import { bs } from '../../libs/bootstrap.js';
import { loader } from '../../libs/loader.js';
import { theme } from '../../common/theme.js';
import { lang } from '../../common/language.js';
import { storage } from '../../common/storage.js';
import { session } from '../../common/session.js';
import { offline } from '../../common/offline.js';
import { comment } from '../components/comment.js';
import * as confetti from '../../libs/confetti.js';

export const guest = (() => {

    /**
     * @type {ReturnType<typeof storage>|null}
     */
    let information = null;

    /**
     * @type {ReturnType<typeof storage>|null}
     */
    let config = null;

    /**
     * @type {object|null}
     */
    let activeEvent = null;

    const EVENTS = {
        vuquy: {
            date: '2026-07-26 10:00:00',
            dateDisplay: 'Chủ Nhật, 26 Tháng 07 2026',
            invitationText: 'Kính mời Quý Khách đến tham dự lễ vu quy',
            ceremony1Title: 'Lễ Vu Quy',
            ceremony1Time: 'Lúc 10:00 sáng',
            ceremony2Title: 'Tiệc Vu Quy',
            ceremony2Time: 'Lúc 11:00 sáng',
            location: 'Tổ chức tại tư gia',
            mapsUrl: 'https://maps.app.goo.gl/qSGgcPn4YXdk2ccY7',
            calendar: {
                start: '2026-07-26 10:00',
                end: '2026-07-26 14:00',
            },
        },
        cuoi: {
            date: '2026-08-02 10:00:00',
            dateDisplay: 'Chủ Nhật, 02 Tháng 08 2026',
            invitationText: 'Kính mời Quý Khách đến tham dự lễ thành hôn',
            ceremony1Title: 'Lễ Thành Hôn',
            ceremony1Time: 'Lúc 10:00 sáng',
            ceremony2Title: 'Lễ Cưới',
            ceremony2Time: 'Lúc 11:00 sáng',
            location: 'Nhà hàng The Luxury',
            mapsUrl: 'https://maps.app.goo.gl/s2WjWNZ81fYzhHFf9?g_st=ic',
            calendar: {
                start: '2026-08-02 10:00',
                end: '2026-08-02 14:00',
            },
        },
    };

    /**
     * @returns {object}
     */
    const getEventConfig = () => {
        const params = new URLSearchParams(window.location.search);
        const event = params.get('event');

        if (event && EVENTS[event]) {
            return EVENTS[event];
        }

        return EVENTS.cuoi;
    };

    /**
     * @returns {void}
     */
    const applyEventConfig = () => {
        activeEvent = getEventConfig();

        document.body.setAttribute('data-time', activeEvent.date);

        document.querySelectorAll('.event-date').forEach((el) => {
            el.textContent = activeEvent.dateDisplay;
        });

        document.getElementById('event-invitation-text')?.replaceChildren(document.createTextNode(activeEvent.invitationText));

        const ceremony1Title = document.getElementById('ceremony-1-title');
        const ceremony1Time = document.getElementById('ceremony-1-time');
        const ceremony2Title = document.getElementById('ceremony-2-title');
        const ceremony2Time = document.getElementById('ceremony-2-time');

        if (ceremony1Title) {
            ceremony1Title.textContent = activeEvent.ceremony1Title;
        }
        if (ceremony1Time) {
            ceremony1Time.textContent = activeEvent.ceremony1Time;
        }
        if (ceremony2Title) {
            ceremony2Title.textContent = activeEvent.ceremony2Title;
        }
        if (ceremony2Time) {
            ceremony2Time.textContent = activeEvent.ceremony2Time;
        }

        const mapsLink = document.getElementById('event-maps-link');
        if (mapsLink) {
            mapsLink.setAttribute('href', activeEvent.mapsUrl);
        }

        const location = document.getElementById('event-location');
        if (location) {
            location.textContent = activeEvent.location;
        }
    };

    /**
     * @returns {void}
     */
    const countDownDate = () => {
        const count = (new Date(document.body.getAttribute('data-time').replace(' ', 'T'))).getTime();

        /**
         * @param {number} num 
         * @returns {string}
         */
        const pad = (num) => num < 10 ? `0${num}` : `${num}`;

        const day = document.getElementById('day');
        const hour = document.getElementById('hour');
        const minute = document.getElementById('minute');
        const second = document.getElementById('second');

        const updateCountdown = () => {
            const distance = Math.abs(count - Date.now());

            day.textContent = pad(Math.floor(distance / (1000 * 60 * 60 * 24)));
            hour.textContent = pad(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
            minute.textContent = pad(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)));
            second.textContent = pad(Math.floor((distance % (1000 * 60)) / 1000));

            util.timeOut(updateCountdown, 1000 - (Date.now() % 1000));
        };

        util.timeOut(updateCountdown);
    };

    /**
     * @returns {void}
     */
    const showGuestName = () => {
        /**
         * Make sure "to=" is the last query string.
         * Ex. ulems.my.id/?id=some-uuid-here&to=name
         */
        const raw = window.location.search.split('to=');
        let name = null;

        if (raw.length > 1 && raw[1].length >= 1) {
            name = window.decodeURIComponent(raw[1]);
        }

        if (name) {
            const guestName = document.getElementById('guest-name');
            const div = document.createElement('div');
            div.classList.add('m-2');

            const template = `<small class="mt-0 mb-1 mx-0 p-0">${util.escapeHtml(guestName?.getAttribute('data-message'))}</small><p class="m-0 p-0" style="font-size: 1.25rem">${util.escapeHtml(name)}</p>`;
            util.safeInnerHTML(div, template);

            guestName?.appendChild(div);
        }

        const form = document.getElementById('form-name');
        if (form) {
            form.value = information.get('name') ?? name;
        }
    };

    /**
     * @returns {void}
     */
    const updateWeGotMarried = () => {
        const params = new URLSearchParams(window.location.search);
        const name = params.get('name');

        if (name) {
            const element = document.getElementById('we-got-married');
            if (element) {
                element.textContent = util.escapeHtml(name);
            } else {
                // Retry after a short delay if element doesn't exist yet
                util.timeOut(() => {
                    const retryElement = document.getElementById('we-got-married');
                    if (retryElement) {
                        retryElement.textContent = util.escapeHtml(name);
                    }
                }, 100);
            }
        }
    };

    /**
     * @returns {Promise<void>}
     */
    const slide = async () => {
        const interval = 6000;
        const slides = document.querySelectorAll('.slide-desktop');

        if (!slides || slides.length === 0) {
            return;
        }

        const desktopEl = document.getElementById('root')?.querySelector('.d-sm-block');
        if (!desktopEl) {
            return;
        }

        desktopEl.dispatchEvent(new Event('undangan.slide.stop'));

        if (window.getComputedStyle(desktopEl).display === 'none') {
            return;
        }

        if (slides.length === 1) {
            await util.changeOpacity(slides[0], true);
            return;
        }

        let index = 0;
        for (const [i, s] of slides.entries()) {
            if (i === index) {
                s.classList.add('slide-desktop-active');
                await util.changeOpacity(s, true);
                break;
            }
        }

        let run = true;
        const nextSlide = async () => {
            await util.changeOpacity(slides[index], false);
            slides[index].classList.remove('slide-desktop-active');

            index = (index + 1) % slides.length;

            if (run) {
                slides[index].classList.add('slide-desktop-active');
                await util.changeOpacity(slides[index], true);
            }

            return run;
        };

        desktopEl.addEventListener('undangan.slide.stop', () => {
            run = false;
        });

        const loop = async () => {
            if (await nextSlide()) {
                util.timeOut(loop, interval);
            }
        };

        util.timeOut(loop, interval);
    };

    /**
     * @param {HTMLButtonElement} button
     * @returns {void}
     */
    const open = (button) => {
        button.disabled = true;
        document.body.scrollIntoView({ behavior: 'instant' });
        document.getElementById('root').classList.remove('opacity-0');

        if (theme.isAutoMode()) {
            document.getElementById('button-theme').classList.remove('d-none');
        }

        updateWeGotMarried();
        slide();
        theme.spyTop();

        confetti.basicAnimation();
        util.timeOut(confetti.openAnimation, 1500);

        document.dispatchEvent(new Event('undangan.open'));
        util.changeOpacity(document.getElementById('welcome'), false).then((el) => el.remove());
    };

    /**
     * @param {HTMLImageElement} img
     * @returns {void}
     */
    const modal = (img) => {
        document.getElementById('button-modal-click').setAttribute('href', img.src);
        document.getElementById('button-modal-download').setAttribute('data-src', img.src);

        const i = document.getElementById('show-modal-image');
        i.src = img.src;
        i.width = img.width;
        i.height = img.height;
        bs.modal('modal-image').show();
    };

    /**
     * @returns {void}
     */
    const modalImageClick = () => {
        document.getElementById('show-modal-image').addEventListener('click', (e) => {
            const abs = e.currentTarget.parentNode.querySelector('.position-absolute');

            abs.classList.contains('d-none')
                ? abs.classList.replace('d-none', 'd-flex')
                : abs.classList.replace('d-flex', 'd-none');
        });
    };

    /**
     * @param {HTMLDivElement} div 
     * @returns {void}
     */
    const showStory = (div) => {
        if (navigator.vibrate) {
            navigator.vibrate(500);
        }

        confetti.tapTapAnimation(div, 100);
        util.changeOpacity(div, false).then((e) => e.remove());
    };

    /**
     * @returns {void}
     */
    const closeInformation = () => information.set('info', true);

    /**
     * @returns {void}
     */
    const normalizeArabicFont = () => {
        document.querySelectorAll('.font-arabic').forEach((el) => {
            el.innerHTML = String(el.innerHTML).normalize('NFC');
        });
    };

    /**
     * @returns {void}
     */
    const animateSvg = () => {
        document.querySelectorAll('svg').forEach((el) => {
            if (el.hasAttribute('data-class')) {
                util.timeOut(() => el.classList.add(el.getAttribute('data-class')), parseInt(el.getAttribute('data-time')));
            }
        });
    };

    /**
     * @returns {void}
     */
    const buildGoogleCalendar = () => {
        /**
         * @param {string} d 
         * @returns {string}
         */
        const formatDate = (d) => {
            const [date, time] = d.split(' ');
            return date.replace(/-/g, '') + 'T' + time.replace(':', '') + '00';
        };

        const event = activeEvent ?? getEventConfig();

        const url = new URL('https://calendar.google.com/calendar/render');
        const data = new URLSearchParams({
            action: 'TEMPLATE',
            text: 'The Wedding of Đại & Đào',
            dates: `${formatDate(event.calendar.start)}/${formatDate(event.calendar.end)}`,
            details: 'The Wedding of Đại & Đào - Sự góp mặt của Quý Khách sẽ là lời chúc phúc ý nghĩa và quý giá nhất đối với gia đình chúng tôi!',
            location: event.location,
            ctz: 'Asia/Ho_Chi_Minh',
        });

        url.search = data.toString();
        document.querySelector('#home button')?.addEventListener('click', () => window.open(url, '_blank'));
    };

    /**
     * @returns {object}
     */
    const loaderLibs = () => {
        progress.add();

        /**
         * @param {{aos: boolean, confetti: boolean}} opt
         * @returns {void}
         */
        const load = (opt) => {
            loader(opt)
                .then(() => progress.complete('libs'))
                .catch(() => progress.invalid('libs'));
        };

        return {
            load,
        };
    };

    /**
     * @returns {Promise<void>}
     */
    const booting = async () => {
        animateSvg();
        countDownDate();
        showGuestName();
        modalImageClick();
        normalizeArabicFont();
        buildGoogleCalendar();

        if (information.has('presence')) {
            document.getElementById('form-presence').value = information.get('presence') ? '1' : '2';
        }

        if (information.get('info')) {
            document.getElementById('information')?.remove();
        }

        // wait until welcome screen is show.
        await util.changeOpacity(document.getElementById('welcome'), true);

        // remove loading screen and show welcome screen.
        await util.changeOpacity(document.getElementById('loading'), false).then((el) => el.remove());
    };

    /**
     * @returns {void}
     */
    const domLoaded = () => {
        lang.init();
        offline.init();
        comment.init();
        progress.init();

        config = storage('config');
        information = storage('information');

        applyEventConfig();

        // Update "We got married" text early if URL parameter exists
        updateWeGotMarried();

        const img = image.init();
        const token = document.body.getAttribute('data-key');
        const params = new URLSearchParams(window.location.search);

        window.addEventListener('resize', util.debounce(slide));
        document.addEventListener('undangan.progress.done', () => booting());
        document.addEventListener('hide.bs.modal', () => document.activeElement?.blur());
        document.getElementById('button-modal-download').addEventListener('click', (e) => {
            img.download(e.currentTarget.getAttribute('data-src'));
        });

        if (!token || token.length <= 0) {
            document.getElementById('comment')?.remove();
            document.querySelector('a.nav-link[href="#comment"]')?.closest('li.nav-item')?.remove();

            // Load priority images (Welcome Page) first
            // Only priority images are counted in progress initially
            img.loadPriorityImages().then(() => {
                // After priority images load, init and load other assets
                const vid = video.init();
                const aud = audio.init();
                const lib = loaderLibs();
                vid.load();
                img.load();
                aud.load();
                lib.load({ confetti: document.body.getAttribute('data-confetti') === 'true' });
            }).catch(() => {
                // If priority images fail, still continue with other assets
                const vid = video.init();
                const aud = audio.init();
                const lib = loaderLibs();
                vid.load();
                img.load();
                aud.load();
                lib.load({ confetti: document.body.getAttribute('data-confetti') === 'true' });
            });
        }

        if (token && token.length > 0) {
            // Load priority images first
            img.loadPriorityImages().then(() => {
                // After priority images load, add config and comment to progress
                progress.add();
                progress.add();

                // if don't have data-src.
                if (!img.hasDataSrc()) {
                    img.load();
                }

                // fetch after document is loaded.
                const load = () => session.guest(params.get('k') ?? token).then(({ data }) => {
                    document.dispatchEvent(new Event('undangan.session'));
                    progress.complete('config');

                    // Init and load other assets after priority images
                    const vid = video.init();
                    const aud = audio.init();
                    const lib = loaderLibs();

                    if (img.hasDataSrc()) {
                        img.load();
                    }

                    vid.load();
                    aud.load();
                    lib.load({ confetti: data.is_confetti_animation });

                    comment.show()
                        .then(() => progress.complete('comment'))
                        .catch(() => progress.invalid('comment'));

                }).catch(() => progress.invalid('config'));

                window.addEventListener('load', load);
            }).catch(() => {
                // If priority images fail, still continue
                progress.add();
                progress.add();

                if (!img.hasDataSrc()) {
                    img.load();
                }

                const load = () => session.guest(params.get('k') ?? token).then(({ data }) => {
                    document.dispatchEvent(new Event('undangan.session'));
                    progress.complete('config');

                    const vid = video.init();
                    const aud = audio.init();
                    const lib = loaderLibs();

                    if (img.hasDataSrc()) {
                        img.load();
                    }

                    vid.load();
                    aud.load();
                    lib.load({ confetti: data.is_confetti_animation });

                    comment.show()
                        .then(() => progress.complete('comment'))
                        .catch(() => progress.invalid('comment'));

                }).catch(() => progress.invalid('config'));

                window.addEventListener('load', load);
            });
        }
    };

    /**
     * @returns {object}
     */
    const init = () => {
        theme.init();
        session.init();

        if (session.isAdmin()) {
            storage('user').clear();
            storage('owns').clear();
            storage('likes').clear();
            storage('session').clear();
            storage('comment').clear();
        }

        document.addEventListener('DOMContentLoaded', domLoaded);

        return {
            util,
            theme,
            comment,
            guest: {
                open,
                modal,
                showStory,
                closeInformation,
            },
        };
    };

    return {
        init,
    };
})();