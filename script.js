(function () {
    'use strict';

    const STORAGE_KEY = 'stoneAgeScoutBadges';
    
    const BADGES = {
        stonehenge: 'Stonehenge Scout',
        avebury: 'Avebury Adventurer',
        callanish: 'Callanish Compass',
        skara: 'Skara Brae Seeker',
        quiz: 'Quiz Master'
    };

    const MAP_LOCATIONS = {
        stonehenge: { name: 'Stonehenge', clue: 'Huge stones arranged in circles within Wiltshire, England.' },
        avebury: { name: 'Avebury', clue: 'A massive prehistoric circle surrounding part of a modern village.' },
        callanish: { name: 'Callanish Stones', clue: 'An impressive cruciform alignment of standing stones in Scotland.' },
        skara: { name: 'Skara Brae', clue: 'A stone-built Neolithic settlement located in the Orkney Archipelago.' }
    };

    const QUIZ_DATA = [
        { q: "What is a single large standing stone set upright called?", o: ["Menhir", "Dolmen", "Stone Circle"], c: 0 },
        { q: "Which age target group is Stone Age Scouts designed for?", o: ["3-5 years", "7-10 years", "Teens"], c: 1 }
    ];

    const currentSite = document.body.dataset.site || 'stonehenge';

    function initNav() {
        const toggle = document.querySelector('.menu-toggle');
        const menu = document.querySelector('.nav-links');
        if (toggle && menu) {
            toggle.addEventListener('click', () => menu.classList.toggle('open'));
        }
    }

    function togglePanel(id, txt) {
        const el = document.getElementById(id);
        if (!el) return;
        el.textContent = txt;
        el.classList.add('show');
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function syncBadges(name) {
        let stored = [];
        try {
            stored = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        } catch (e) {
            stored = [];
        }
        if (name && !stored.includes(name)) {
            stored.push(name);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
        }
        return stored;
    }

    function updateBadgeUI() {
        const box = document.querySelector('.badge-row') || document.getElementById('badgeList');
        if (!box) return;

        const items = syncBadges();
        if (!items.length) {
            box.innerHTML = '<span class="empty-notice">No badges earned yet — complete a quiz to unlock one!</span>';
            return;
        }

        box.innerHTML = items.map(id => `<span class="badge-item badge">★ ${BADGES[id] || id}</span>`).join('');
    }

    function initMap() {
        const title = document.getElementById('mapTargetTitle');
        const clue = document.getElementById('mapTargetClue');
        
        document.querySelectorAll('.map-marker').forEach(marker => {
            marker.addEventListener('click', (e) => {
                const key = e.target.getAttribute('data-site');
                if (title && clue && MAP_LOCATIONS[key]) {
                    title.textContent = MAP_LOCATIONS[key].name;
                    clue.textContent = MAP_LOCATIONS[key].clue;
                }
            });
        });
    }

    function handleMiniQuiz(btn, isCorrect) {
        const group = btn.parentNode.querySelectorAll('.option');
        group.forEach(opt => opt.disabled = true);

        if (isCorrect) {
            btn.classList.add('correct');
            syncBadges(currentSite);
            updateBadgeUI();
        } else {
            btn.classList.add('wrong');
        }
    }

    function renderMiniQuiz() {
        const wrapper = document.getElementById('siteFeedback');
        if (!wrapper) return;

        wrapper.innerHTML = `
            <div class="question">
                <p><strong>Mini Quiz:</strong> Is this monument from prehistoric times?</p>
                <button class="option json-true">Yes, it is thousands of years old!</button>
                <button class="option json-false">No, it was built recently.</button>
            </div>
        `;

        wrapper.querySelector('.json-true').addEventListener('click', (e) => handleMiniQuiz(e.target, true));
        wrapper.querySelector('.json-false').addEventListener('click', (e) => handleMiniQuiz(e.target, false));
        wrapper.classList.add('show');
    }

    function evaluateGlobal(btn, qIdx, oIdx) {
        const root = btn.parentNode;
        const group = root.querySelectorAll('.option');
        group.forEach(opt => opt.disabled = true);

        if (oIdx === QUIZ_DATA[qIdx].c) {
            btn.classList.add('correct');
        } else {
            btn.classList.add('wrong');
            group[QUIZ_DATA[qIdx].c].classList.add('correct');
        }

        const total = document.querySelectorAll('#quizContainer .option').length;
        const done = document.querySelectorAll('#quizContainer .option:disabled').length;

        if (total > 0 && total === done) {
            syncBadges('quiz');
            updateBadgeUI();
            const doneBox = document.getElementById('globalSummary');
            if (doneBox) doneBox.classList.add('show');
        }
    }

    function initGlobalQuiz() {
        const wrap = document.getElementById('quizContainer');
        if (!wrap) return;

        wrap.innerHTML = QUIZ_DATA.map((item, qIdx) => `
            <div class="question" data-quiz="${qIdx}">
                <p><strong>Question ${qIdx + 1}:</strong> ${item.q}</p>
                ${item.o.map((opt, oIdx) => `<button class="option" data-opt="${oIdx}">${opt}</button>`).join('')}
            </div>
        `).join('') + `<div class="quiz-summary" id="globalSummary">Amazing Job! You unlocked the Quiz Master badge!</div>`;

        wrap.querySelectorAll('.option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const qIdx = parseInt(e.target.closest('.question').dataset.quiz, 10);
                const oIdx = parseInt(e.target.dataset.opt, 10);
                evaluateGlobal(e.target, qIdx, oIdx);
            });
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        initNav();
        updateBadgeUI();
        initMap();
        initGlobalQuiz();

        const fBtn = document.querySelector('.fact-btn');
        if (fBtn) {
            fBtn.addEventListener('click', () => {
                togglePanel('siteFeedback', 'Fun fact: Stonehenge was built long before the Romans arrived in Britain.');
            });
        }

        const qBtn = document.querySelector('.quiz-btn');
        if (qBtn) qBtn.addEventListener('click', renderMiniQuiz);
    });
})();
