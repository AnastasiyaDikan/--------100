document.addEventListener('DOMContentLoaded', () => {
    // --- КОНСТАНТЫ И ДАННЫЕ ДЛЯ РАСЧЕТОВ ---
    const movementData = {
        0: { half: 0, full: 0, charge: 0, run: 0 }, 1: { half: 1, full: 2, charge: 3, run: 6 },
        2: { half: 2, full: 4, charge: 6, run: 12 }, 3: { half: 3, full: 6, charge: 9, run: 18 },
        4: { half: 4, full: 8, charge: 12, run: 24 }, 5: { half: 5, full: 10, charge: 15, run: 30 },
        6: { half: 6, full: 12, charge: 18, run: 36 }, 7: { half: 7, full: 14, charge: 21, run: 42 },
        8: { half: 8, full: 16, charge: 24, run: 48 }, 9: { half: 9, full: 18, charge: 27, run: 54 },
        10: { half: 10, full: 20, charge: 30, run: 60 }, 11: { half: 11, full: 22, charge: 33, run: 66 },
        12: { half: 12, full: 24, charge: 36, run: 72 }, 13: { half: 13, full: 26, charge: 39, run: 78 },
        14: { half: 14, full: 28, charge: 42, run: 84 }
    };
    const carryData = {
        0: { carry: 0, lift: 0, push: 0 }, 1: { carry: 4.5, lift: 9, push: 18 }, 2: { carry: 9, lift: 22.5, push: 45 },
        3: { carry: 13.5, lift: 34, push: 68 }, 4: { carry: 22.5, lift: 56, push: 112 }, 5: { carry: 34, lift: 84, push: 168 },
        6: { carry: 45, lift: 112, push: 224 }, 7: { carry: 56, lift: 140, push: 280 }, 8: { carry: 67.5, lift: 168, push: 336 },
        9: { carry: 79, lift: 198, push: 396 }, 10: { carry: 90, lift: 225, push: 450 }, 11: { carry: 112, lift: 280, push: 560 },
        12: { carry: 135, lift: 338, push: 676 }, 13: { carry: 158, lift: 396, push: 792 }, 14: { carry: 180, lift: 450, push: 900 },
        15: { carry: 225, lift: 563, push: 1126 }, 16: { carry: 270, lift: 675, push: 1350 }, 17: { carry: 315, lift: 788, push: 1576 },
        18: { carry: 360, lift: 900, push: 1800 }, 19: { carry: 450, lift: 1125, push: 2250 }, 20: { carry: 540, lift: 1350, push: 2700 }
    };
    const improvementCosts = { 0: [500, 1000, 2000, 4000, 8000], 1: [250, 500, 1000, 2000, 4000], 2: [100, 200, 400, 800, 1600] };
    const characteristicToAptitudeMap = { 'agility': 'ag', 'strength': 's', 'perception': 'per', 'fellowship': 'fel', 'intelligence': 'int', 'willpower': 'wp', 'melee': 'ws', 'ranged': 'bs', 'endurance': 't' };
    
    // --- ГЛАВНАЯ ФУНКЦИЯ ОБНОВЛЕНИЯ РАССЧИТЫВАЕМЫХ ПОЛЕЙ ---
    function updateCalculatedStats() {
        const getModifier = (statId) => Math.floor((parseInt(document.getElementById(statId).value, 10) || 0) / 10);

        const strMod = getModifier('stat-strength');
        const endMod = getModifier('stat-endurance');
        const wpMod = getModifier('stat-willpower');
        const agiMod = getModifier('stat-agility');

        const totalWounds = strMod + wpMod + (endMod * 2);
        document.getElementById('wounds-total').value = totalWounds;
        document.getElementById('wounds-current').max = totalWounds;

        document.getElementById('fatigue-threshold').value = endMod + wpMod;

        const moveValues = movementData[agiMod] || movementData[0];
        document.getElementById('move-half').value = moveValues.half;
        document.getElementById('move-full').value = moveValues.full;
        document.getElementById('move-charge').value = moveValues.charge;
        document.getElementById('move-run').value = moveValues.run;

        const carryBonusSum = strMod + endMod;
        const carryValues = carryData[carryBonusSum] || carryData[0];
        document.getElementById('carry-capacity').value = `${carryValues.carry} кг`;
        document.getElementById('lift-capacity').value = `${carryValues.lift} кг`;
        document.getElementById('push-capacity').value = `${carryValues.push} кг`;
    }

    // --- ОБРАБОТЧИК УСТАЛОСТИ ---
    const fatigueCurrentInput = document.getElementById('fatigue-current');
    fatigueCurrentInput.addEventListener('input', () => {
        const current = parseInt(fatigueCurrentInput.value, 10) || 0;
        const threshold = parseInt(document.getElementById('fatigue-threshold').value, 10) || 0;
        if (threshold === 0) return;

        if (current >= threshold * 2) {
            alert("Персонаж мертв от переутомления!");
        } else if (current >= threshold) {
            alert("Персонаж без сознания!");
        }
    });

    // --- ОБРАБОТЧИКИ ИЗМЕНЕНИЯ БАЗОВЫХ ХАРАКТЕРИСТИК ---
    const statInputsForCalculations = ['stat-agility', 'stat-strength', 'stat-willpower', 'stat-endurance'];
    statInputsForCalculations.forEach(id => {
        document.getElementById(id).addEventListener('input', updateCalculatedStats);
    });
    
    // ... (весь остальной JS код, который был ранее, до секции сохранения/загрузки)

    // --- ЛИСТ ТАЛАНТОВ ---
    const talentsButton = document.getElementById('talents-button');
    const talentsSheet = document.getElementById('talents-sheet');
    const closeTalentsBtn = document.querySelector('.close-talents-btn');
    const talentTabsContainer = document.querySelector('.talents-tabs');

    talentsButton.addEventListener('click', () => talentsSheet.classList.remove('hidden'));
    closeTalentsBtn.addEventListener('click', () => talentsSheet.classList.add('hidden'));

    talentTabsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('talent-tab-btn')) {
            const tabType = e.target.dataset.tab;
            talentTabsContainer.querySelector('.active').classList.remove('active');
            e.target.classList.add('active');

            document.querySelector('.talent-tab-content.active').classList.remove('active');
            document.getElementById(`tab-${tabType}`).classList.add('active');
        }
    });

    function addTalentRow(type, data = null) {
        const container = document.getElementById(`${type}-talents-container`);
        const talentItem = document.createElement('div');
        talentItem.className = 'talent-item';
        talentItem.innerHTML = `
            <div class="talent-item-fields">
                <div>
                    <label>Наименование</label>
                    <input type="text" class="talent-name" value="${data ? data.name : ''}">
                </div>
                <div>
                    <label>Описание</label>
                    <textarea class="talent-desc">${data ? data.description : ''}</textarea>
                </div>
                <div>
                    <label>Требование</label>
                    <input type="text" class="talent-req" value="${data ? data.requirement : ''}">
                </div>
            </div>
            <button class="remove-talent-btn" title="Удалить талант">×</button>
        `;
        container.appendChild(talentItem);
        talentItem.querySelector('.remove-talent-btn').addEventListener('click', () => {
            talentItem.remove();
        });
    }

    document.querySelectorAll('.add-talent-btn').forEach(btn => {
        btn.addEventListener('click', () => addTalentRow(btn.dataset.type));
    });

    ['combat', 'social', 'mental'].forEach(type => addTalentRow(type));


    // ==========================================================
    // --- ПОЛНОЦЕННОЕ СОХРАНЕНИЕ И ЗАГРУЗКА (ИСПРАВЛЕНО) ---
    // ==========================================================
    
    function getFormData() {
        const data = {
            inputs: {}, checkboxes: {}, aptitudes: {}, dynamicSkills: {}, improvements: {}, talents: { combat: [], social: [], mental: [] },
            abyssBreakthroughs: [],
            experience: { current: currentExpInput.value, used: usedExpInput.value, total: totalExpInput.value },
            basicInfo: { name: document.getElementById('char-name').value, race: document.getElementById('char-race').value, background: document.getElementById('char-background').value, role: document.getElementById('char-role').value, age: document.getElementById('char-age').value, gender: document.getElementById('char-gender').value },
            appearance: { skin: document.getElementById('char-skin').value, eyes: document.getElementById('char-eyes').value, hair: document.getElementById('char-hair').value, build: document.getElementById('char-build').value },
            vitals: { woundsCurrent: document.getElementById('wounds-current').value, fatigueCurrent: fatigueCurrentInput.value },
            avatar: avatarData,
            campaignNotes: localStorage.getItem('campaignNotes') || '',
            fatePoints: { current: parseInt(fateCurrentInput.value) || 3, max: parseInt(fateMaxInput.value) || 3 },
            abyssPoints: parseInt(document.getElementById('abyss-points').value) || 0,
        };

        document.querySelectorAll('input[type="text"], input[type="number"]').forEach(input => {
            if (input.id && !input.closest('.dynamic-skill, .relationship-item, .mutation-item, .corruption-item, .breakthrough-item')) {
                 data.inputs[input.id] = input.value;
            }
        });
        
        document.querySelectorAll('.skills-table input[type="checkbox"]').forEach(checkbox => {
            if (!checkbox.id.includes('-sub')) data.checkboxes[checkbox.id] = checkbox.checked;
        });

        document.querySelectorAll('.aptitude-item').forEach(item => {
            data.aptitudes[item.dataset.aptitude] = item.querySelectorAll('.dot.filled').length;
        });
        
        skillTypes.forEach(type => {
            data.dynamicSkills[type] = Array.from(document.getElementById(`${type}-container`).querySelectorAll('.skill-sub-row')).map(row => ({
                name: row.querySelector('.skill-name').textContent,
                k: row.querySelector('[data-level="1"]').checked,
                plus10: row.querySelector('[data-level="2"]').checked,
                plus20: row.querySelector('[data-level="3"]').checked,
                plus30: row.querySelector('[data-level="4"]').checked,
                plus40: row.querySelector('[data-level="5"]').checked
            }));
        });
        
        document.querySelectorAll('.stat-item').forEach(item => {
            const statInput = item.querySelector('input[type="number"]');
            const statName = statInput.id.replace('stat-', '');
            data.improvements[statName] = item.querySelectorAll('.improvement-dot.filled').length;
        });

        document.getElementById('abyss-breakthrough-container').querySelectorAll('.breakthrough-item').forEach(item => {
            data.abyssBreakthroughs.push({ description: item.querySelector('input').value });
        });

        ['combat', 'social', 'mental'].forEach(type => {
            document.getElementById(`${type}-talents-container`).querySelectorAll('.talent-item').forEach(item => {
                data.talents[type].push({
                    name: item.querySelector('.talent-name').value,
                    description: item.querySelector('.talent-desc').value,
                    requirement: item.querySelector('.talent-req').value
                });
            });
        });
        
        return data;
    }

    function setFormData(data) {
        if (data.inputs) for (const id in data.inputs) if (document.getElementById(id)) document.getElementById(id).value = data.inputs[id];
        if (data.checkboxes) for (const id in data.checkboxes) if (document.getElementById(id)) document.getElementById(id).checked = data.checkboxes[id];

        if (data.aptitudes) for (const name in data.aptitudes) {
            const item = document.querySelector(`.aptitude-item[data-aptitude="${name}"]`);
            if (item) item.querySelectorAll('.dot').forEach((dot, i) => dot.classList.toggle('filled', i < data.aptitudes[name]));
        }

        if (data.improvements) for (const name in data.improvements) {
            const item = document.querySelector(`#stat-${name}`)?.closest('.stat-item');
            if(item) item.querySelectorAll('.improvement-dot').forEach((dot, i) => dot.classList.toggle('filled', i < data.improvements[name]));
        }

        if (data.dynamicSkills) skillTypes.forEach(type => {
            const container = document.getElementById(`${type}-container`);
            container.innerHTML = '';
            if (data.dynamicSkills[type] && data.dynamicSkills[type].length > 0) {
                data.dynamicSkills[type].forEach(skillData => addSkillRow(type, skillData));
            } else { addSkillRow(type); }
        });

        if (data.abyssBreakthroughs) {
            const container = document.getElementById('abyss-breakthrough-container');
            container.innerHTML = '';
            if (data.abyssBreakthroughs.length > 0) {
                data.abyssBreakthroughs.forEach(b => addAbyssBreakthrough(b));
            } else { addAbyssBreakthrough(); }
        }
        
        if (data.talents) {
            ['combat', 'social', 'mental'].forEach(type => {
                const container = document.getElementById(`${type}-talents-container`);
                container.innerHTML = '';
                if (data.talents[type] && data.talents[type].length > 0) {
                    data.talents[type].forEach(t => addTalentRow(type, t));
                } else { addTalentRow(type); }
            });
        }
        
        if (data.vitals) {
            document.getElementById('wounds-current').value = data.vitals.woundsCurrent || 0;
            fatigueCurrentInput.value = data.vitals.fatigueCurrent || 0;
        }

        if (data.avatar) {
            avatarData = data.avatar;
            avatarPlaceholder.style.backgroundImage = `url(${data.avatar})`;
            avatarPlaceholder.classList.add('has-image');
            avatarPlaceholder.querySelector('span').style.display = 'none';
        }

        // ОБЯЗАТЕЛЬНО ПЕРЕСЧИТАТЬ ВСЕ ЗАВИСИМЫЕ ПОЛЯ ПОСЛЕ ЗАГРУЗКИ
        updateCalculatedStats();
    }

    document.getElementById('save-button').addEventListener('click', () => {
        const data = getFormData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const charName = (document.getElementById('char-name').value.trim() || 'character').replace(/[^a-z0-9]/gi, '_');
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${charName}.json`;
        a.click();
        URL.revokeObjectURL(a.href);
    });

    document.getElementById('file-input').addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    setFormData(JSON.parse(e.target.result));
                } catch (error) {
                    console.error("Ошибка чтения файла:", error);
                    alert('Ошибка при чтении файла.');
                }
            };
            reader.readAsText(file);
            event.target.value = '';
        }
    });

    // ПЕРВЫЙ РАСЧЕТ ПРИ ЗАГРУЗКЕ СТРАНИЦЫ
    updateCalculatedStats();
});