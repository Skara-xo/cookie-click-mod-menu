// ==UserScript==
// @name         Cookie Clicker - Mod Menu avec AutoClick et AutoReindeer et Toggle Mute/Expand
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Mod menu avec autoclick, auto reindeer, expand/sourdine avec raccourcis clavier, sauvegarde, export, UI draggable sur titre uniquement.
// @author       Adapted
// @match        *://orteil.dashnet.org/cookieclicker/*
// @downloadURL  https://github.com/Skara-xo/cookieclickxxx/blob/main/CookieClicker-ModMenu.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const waitForGame = setInterval(() => {
        if (typeof Game !== 'undefined' && Game.ready) {
            clearInterval(waitForGame);
            initModMenu();
        }
    }, 500);

    function initModMenu() {
        const menu = document.createElement('div');
        menu.id = 'hackMenu';
        menu.style.position = 'fixed';
        menu.style.top = '15px';
        menu.style.left = '50%';
        menu.style.transform = 'translateX(-50%)';
        menu.style.zIndex = 10000;
        menu.style.background = 'rgba(0, 0, 0, 0.85)';
        menu.style.color = '#fff';
        menu.style.padding = '6px 12px';
        menu.style.borderRadius = '10px';
        menu.style.fontFamily = 'Arial, sans-serif';
        menu.style.fontSize = '13px';
        menu.style.boxShadow = '0 0 8px #000';
        menu.style.display = 'flex';
        menu.style.alignItems = 'center';
        menu.style.gap = '10px';
        menu.style.userSelect = 'none';
        menu.style.cursor = 'default';

        const title = document.createElement('div');
        title.textContent = 'Mod Menu';
        title.style.fontWeight = 'bold';
        title.style.marginRight = '10px';
        title.style.cursor = 'grab';
        menu.appendChild(title);

        const createButton = (emoji, label, titleText, onclick, id) => {
            const btn = document.createElement('div');
            btn.innerHTML = `${emoji} ${label}`;
            btn.title = titleText;
            btn.id = id;
            btn.style.cursor = 'pointer';
            btn.style.padding = '4px 10px';
            btn.style.border = '1px solid #ccc';
            btn.style.borderRadius = '6px';
            btn.style.background = '#333';
            btn.style.transition = 'background 0.2s, border 0.2s';
            btn.style.color = '#fff';

            btn.onmouseenter = () => {
                if ((btn.id === 'btnAuto' && autoclickerActive) || (btn.id === 'btnAutoReindeer' && autoreindeerActive)) {
                    btn.style.background = 'green'; // ON = fond vert toujours
                } else {
                    btn.style.background = '#555'; // OFF = éclaircissement au survol
                }
            };

            btn.onmouseleave = () => {
                if ((btn.id === 'btnAuto' && autoclickerActive) || (btn.id === 'btnAutoReindeer' && autoreindeerActive)) {
                    btn.style.background = 'green';
                } else {
                    btn.style.background = '#333';
                }
            };

            btn.onclick = () => {
                PlaySound('snd/tick.mp3');
                onclick();
            };
            return btn;
        };

        // AutoClick
        let autoclickerActive = false;
        let interval = null;
        let restartTimeout = null;
        const btnAuto = createButton('🖱️', 'AutoClick', 'Activer/Désactiver AutoClick', () => {
            autoclickerActive = !autoclickerActive;
            updateAutoClickStyle();
            if (autoclickerActive) {
                interval = setInterval(() => Game.ClickCookie(), 10);
                if (restartTimeout) clearTimeout(restartTimeout);
            } else {
                clearInterval(interval);
                restartTimeout = setTimeout(() => {
                    if (!autoclickerActive) btnAuto.click();
                }, 5000);
            }
        }, 'btnAuto');

        function updateAutoClickStyle() {
            btnAuto.style.background = autoclickerActive ? 'green' : '#333';
            btnAuto.style.color = '#fff';
            btnAuto.style.borderColor = autoclickerActive ? 'lime' : '#ccc';
        }

        // Auto-Reindeer
        let autoreindeerActive = true; // ON par défaut
        const btnAutoReindeer = createButton('🎅', 'AutoReindeer', 'Auto-click sur les rennes (Noël)', () => {
            autoreindeerActive = !autoreindeerActive;
            updateAutoReindeerStyle();
        }, 'btnAutoReindeer');

        function updateAutoReindeerStyle() {
            btnAutoReindeer.style.background = autoreindeerActive ? 'green' : '#333';
            btnAutoReindeer.style.color = '#fff';
            btnAutoReindeer.style.borderColor = autoreindeerActive ? 'lime' : '#ccc';
        }

        // Sourdine (renommé Expand)
        let buildingsMuted = false;
        const btnMute = createButton('↕️', 'Expand', 'Réduire/agrandir les bâtiments', () => {
            for (let i in Game.ObjectsById) {
                Game.ObjectsById[i].mute(!buildingsMuted);
            }
            buildingsMuted = !buildingsMuted;
        });

        // Save
        const btnSave = createButton('💾', 'Save', 'Sauvegarder manuellement', () => {
            Game.toSave = true;
        });

        // Export
        const btnExport = createButton('📤', 'Export', 'Exporter la sauvegarde', () => {
            Game.ExportSave();
        });

        // Ajout des boutons dans l’ordre
        menu.appendChild(btnAuto);
        menu.appendChild(btnAutoReindeer);
        menu.appendChild(btnMute);
        menu.appendChild(btnSave);
        menu.appendChild(btnExport);

        document.body.appendChild(menu);

        // Activation auto au démarrage (AutoClick ON aussi)
        setTimeout(() => {
            if (!autoclickerActive) {
                btnAuto.click();
                updateAutoClickStyle();
            }
            updateAutoReindeerStyle();
        }, 500);

        // Drag & drop uniquement sur titre
        let offsetX = 0, offsetY = 0, dragging = false;

        title.addEventListener('mousedown', function(e) {
            dragging = true;
            offsetX = e.clientX - menu.getBoundingClientRect().left;
            offsetY = e.clientY - menu.getBoundingClientRect().top;
            document.body.style.userSelect = 'none';
            title.style.cursor = 'grabbing';
        });

        document.addEventListener('mousemove', function(e) {
            if (dragging) {
                menu.style.left = (e.clientX - offsetX) + 'px';
                menu.style.top = (e.clientY - offsetY) + 'px';
                menu.style.transform = 'none';
            }
        });

        document.addEventListener('mouseup', function() {
            if (dragging) {
                dragging = false;
                document.body.style.userSelect = '';
                title.style.cursor = 'grab';
            }
        });

        // Auto Reindeer Logic
        setInterval(() => {
            if (!autoreindeerActive) return;
            if (Game.season !== 'christmas') return;

            for (let i in Game.shimmers) {
                const shimmer = Game.shimmers[i];
                if (shimmer.type === 'reindeer' && !shimmer.clickedByAuto) {
                    shimmer.clickedByAuto = true;
                    setTimeout(() => {
                        shimmer.pop();
                        PlaySound('snd/reindeer.mp3');
                    }, 2000);
                }
            }
        }, 500);

        // Gestion toggle Expand / Sourdine pour bâtiments via touches 1,2,3,4 AZERTY (correspondance & é " ')
        window.addEventListener('keydown', e => {
            if (e.repeat) return;

            // Helper pour toggle entre expand et mute
            function toggleBuildingMuteExpand(buildingId) {
                const expandBtn = document.getElementById(`mutedProduct${buildingId}`);
                const muteBtn = document.getElementById(`productMute${buildingId}`);

                if (!expandBtn || !muteBtn) return;

                // Si expand visible (donc non sourdine), on clique sur muteBtn
                // Sinon on clique sur expandBtn
                const isMuted = Game.ObjectsById[buildingId].muted;
                if (isMuted) {
                    expandBtn.click(); // on expand (unmute)
                } else {
                    muteBtn.click();   // on mute
                }
            }

            switch(e.key) {
                case 'a':
                case 'A':
                    btnAuto.click();
                    break;
                case 'z':
                case 'Z':
                    btnMute.click();
                    break;
                case '&': // touche 1 : église / building id 2
                    toggleBuildingMuteExpand(2);
                    break;
                case 'é': // touche 2 : banque / building id 5
                    toggleBuildingMuteExpand(5);
                    break;
                case '"': // touche 3 : panthéon / building id 6
                    toggleBuildingMuteExpand(6);
                    break;
                case '\'': // touche 4 : tour des mages / building id 7
                    toggleBuildingMuteExpand(7);
                    break;
            }
        });

    }
})();
