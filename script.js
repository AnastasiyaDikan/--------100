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
    function  updateCalculatedStats ( )  { 
        const getModifier = (statId) => Math.floor((parseInt(document.getElementById(statId).value, 10) || 0) / 10);

        const strMod = getModifier('stat-strength');
        const endMod = getModifier('stat-endurance');
        const wpMod = getModifier('stat-willpower');
        const agiMod = getModifier('stat-agility');

        // РАНЫ БОЛЬШЕ НЕ РАССЧИТЫВАЕМ АВТОМАТИЧЕСКИ
        // Просто оставляем поле как есть, без изменений

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
        document.getElementById(id)?.addEventListener('input', updateCalculatedStats);
    });
    
    // --- СКЛОННОСТИ ---
    document.querySelectorAll('.aptitude-item').forEach(item => {
        item.querySelectorAll('.dot').forEach((dot, index) => {
            dot.addEventListener('click', () => {
                const isFilled = dot.classList.contains('filled');
                if (isFilled) {
                    dot.classList.remove('filled');
                } else {
                    item.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('filled', i <= index));
                }
            });
        });
    });

    // --- АВАТАРКА ---
    const avatarPlaceholder = document.getElementById('avatar-placeholder');
    const avatarInput = document.getElementById('avatar-input');
    let avatarData = null;
    document.getElementById('avatar-upload-btn').addEventListener('click', () => avatarInput.click());
    avatarInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                avatarData = e.target.result;
                avatarPlaceholder.style.backgroundImage = `url(${avatarData})`;
                avatarPlaceholder.classList.add('has-image');
                avatarPlaceholder.querySelector('span').style.display = 'none';
            };
            reader.readAsDataURL(file);
        }
    });

    // --- МОДАЛЬНЫЕ ОКНА ---
    const notesModal = document.getElementById('notes-modal');
const campaignNotes = document.getElementById('campaign-notes');
document.getElementById('notes-button').addEventListener('click', () => {
    notesModal.style.display = 'block';
});
document.getElementById('notes-save').addEventListener('click', () => {
    notesModal.style.display = 'none';
});
document.getElementById('notes-cancel').addEventListener('click', () => {
    notesModal.style.display = 'none';
});
window.addEventListener('click', (event) => {
    if (event.target === notesModal) notesModal.style.display = 'none';
});
    
    // --- СКРЫТИЕ/ПОКАЗ СЕКЦИЙ ---
    document.querySelectorAll('.skill-characteristic-header, .section-header').forEach(header => {
        header.addEventListener('click', () => {
            let content;
            if (header.classList.contains('section-header')) {
                content = header.nextElementSibling;
            } else if (header.dataset.characteristic) {
                content = document.getElementById(`skills-${header.dataset.characteristic}`);
            }

            if (content) {
                const toggleIcon = header.querySelector('.toggle-icon');
                const isHidden = content.style.display === 'none' || content.style.display === '';
                content.style.display = isHidden ? 'block' : 'none';
                header.classList.toggle('active', isHidden);
                if (toggleIcon) toggleIcon.textContent = isHidden ? '▼' : '▶';
            }
        });
    });

    // --- ДИНАМИЧЕСКИЕ НАВЫКИ ---
    const skillTypes = ['lore-common', 'lore-forbidden', 'linguistics', 'lore-scholastic', 'trade'];
    let currentRowToRemove = null;
    let currentSkillTypeToRemove = null;
    const confirmModal = document.getElementById('confirm-modal');
    document.getElementById('confirm-yes').addEventListener('click', () => {
        if (currentRowToRemove) {
            currentRowToRemove.remove();
            if (currentSkillTypeToRemove) reindexSkillRows(currentSkillTypeToRemove);
            closeConfirmModal();
        }
    });
    document.getElementById('confirm-no').addEventListener('click', closeConfirmModal);
    function closeConfirmModal() {
        confirmModal.style.display = 'none';
        currentRowToRemove = null;
        currentSkillTypeToRemove = null;
    }
    const placeholders = {
        'lore-common': 'Область знаний...', 'lore-forbidden': 'Область знаний...',
        'linguistics': 'Язык...', 'lore-scholastic': 'Область знаний...', 'trade': 'Вид ремесла...'
    };
    function getPlaceholder(skillType) { return placeholders[skillType] || 'Название...'; }

    function addSkillRow(skillType, data = null) {
        const container = document.getElementById(`${skillType}-container`);
        const rowIndex = container.children.length + 1;
        const row = document.createElement('tr');
        row.className = 'skill-sub-row';
        row.innerHTML = `
            <td>
                <button type="button" class="remove-skill-btn" title="Удалить навык">×</button>
                <span class="skill-name dynamic-skill" data-skill="${skillType}-sub${rowIndex}">${(data && data.name) ? data.name : getPlaceholder(skillType)}</span>
                <span class="skill-value" data-skill="${skillType}-sub${rowIndex}"></span>
            </td>
            <td><input type="checkbox" id="${skillType}-sub${rowIndex}-k" data-skill="${skillType}-sub${rowIndex}" data-level="1" data-characteristic="intelligence"></td>
            <td><input type="checkbox" id="${skillType}-sub${rowIndex}-10" data-skill="${skillType}-sub${rowIndex}" data-level="2" data-characteristic="intelligence"></td>
            <td><input type="checkbox" id="${skillType}-sub${rowIndex}-20" data-skill="${skillType}-sub${rowIndex}" data-level="3" data-characteristic="intelligence"></td>
            <td><input type="checkbox" id="${skillType}-sub${rowIndex}-30" data-skill="${skillType}-sub${rowIndex}" data-level="4" data-characteristic="intelligence"></td>
            <td><input type="checkbox" id="${skillType}-sub${rowIndex}-40" data-skill="${skillType}-sub${rowIndex}" data-level="5" data-characteristic="intelligence"></td>
        `;
        container.appendChild(row);

        if (data) {
            row.querySelector('[data-level="1"]').checked = data.k || false;
            row.querySelector('[data-level="2"]').checked = data.plus10 || false;
            row.querySelector('[data-level="3"]').checked = data.plus20 || false;
            row.querySelector('[data-level="4"]').checked = data.plus30 || false;
            row.querySelector('[data-level="5"]').checked = data.plus40 || false;
        }

        row.querySelectorAll('input[type="checkbox"]').forEach(checkbox => checkbox.addEventListener('change', handleSkillCheckboxChange));
        row.querySelector('.remove-skill-btn').addEventListener('click', () => {
            currentRowToRemove = row;
            currentSkillTypeToRemove = skillType;
            confirmModal.style.display = 'block';
        });
        row.querySelector('.skill-name').addEventListener('click', handleSkillNameClick);
    }
    
    function reindexSkillRows(skillType) {
        document.getElementById(`${skillType}-container`).querySelectorAll('.skill-sub-row').forEach((row, index) => {
            const newIndex = index + 1;
            const newSkillId = `${skillType}-sub${newIndex}`;
            row.querySelector('.skill-name').dataset.skill = newSkillId;
            row.querySelector('.skill-value').dataset.skill = newSkillId;
            row.querySelectorAll('input[type="checkbox"]').forEach((cb, i) => {
                const levelMap = { 0: 'k', 1: '10', 2: '20', 3: '30', 4: '40' };
                cb.id = `${newSkillId}-${levelMap[i] || i}`;
                cb.dataset.skill = newSkillId;
            });
        });
    }

    document.querySelectorAll('.add-skill-btn').forEach(button => {
        button.addEventListener('click', () => addSkillRow(button.dataset.skillType));
    });
    skillTypes.forEach(addSkillRow);
    
    function handleSkillNameClick(event) {
        const span = event.target;
        makeSkillNameEditable(span);
    }

    function makeSkillNameEditable(span) {
        const originalText = span.textContent;
        const isPlaceholder = Object.values(placeholders).includes(originalText);

        if (!isPlaceholder) {
            toggleSkillValueDisplay({ target: span });
            return;
        }

        const input = document.createElement('input');
        input.type = 'text';
        input.value = originalText;
        input.className = 'skill-name-input';
        span.replaceWith(input);
        input.focus();

        const save = () => {
            const skillType = input.closest('tbody').id.replace('-container', '');
            span.textContent = input.value.trim() || getPlaceholder(skillType);
            input.replaceWith(span);
        };
        input.addEventListener('blur', save);
        input.addEventListener('keydown', (e) => { if (e.key === 'Enter') save(); });
    }

    // --- РАСЧЕТ ЗНАЧЕНИЯ НАВЫКА ---
    function calculateSkillValue(skillName) {
        const checkboxes = document.querySelectorAll(`input[data-skill="${skillName}"]`);
        let skillBonus = -20;
        if (checkboxes[0] && checkboxes[0].checked) skillBonus = 0;
        if (checkboxes[1] && checkboxes[1].checked) skillBonus = 10;
        if (checkboxes[2] && checkboxes[2].checked) skillBonus = 20;
        if (checkboxes[3] && checkboxes[3].checked) skillBonus = 30;
        if (checkboxes[4] && checkboxes[4].checked) skillBonus = 40;
        const characteristic = checkboxes[0]?.dataset.characteristic;
        if (!characteristic) return -20;
        const charValue = parseInt(document.getElementById(`stat-${characteristic}`).value) || 0;
        return charValue + skillBonus;
    }

    function toggleSkillValueDisplay(event) {
        const skillName = event.target.dataset.skill;
        const valueElement = document.querySelector(`.skill-value[data-skill="${skillName}"]`);
        if (valueElement.classList.toggle('visible')) {
            valueElement.textContent = calculateSkillValue(skillName);
        }
    }
    
    
    document.querySelectorAll('.skill-name:not(.dynamic-skill)').forEach(el => el.addEventListener('click', toggleSkillValueDisplay));
    
    // --- ОПЫТ ---
    const currentExpInput = document.getElementById('current-exp');
    const usedExpInput = document.getElementById('used-exp');
    const totalExpInput = document.getElementById('total-exp');
    const canSpendExperience = (cost) => (parseInt(currentExpInput.value) || 0) >= cost;
    const spendExperience = (cost) => {
        if (canSpendExperience(cost)) {
            currentExpInput.value = (parseInt(currentExpInput.value) || 0) - cost;
            usedExpInput.value = (parseInt(usedExpInput.value) || 0) + cost;
            updateTotalExperience();
            return true;
        }
        return false;
    };
    const updateTotalExperience = () => totalExpInput.value = (parseInt(currentExpInput.value) || 0) + (parseInt(usedExpInput.value) || 0);
    [currentExpInput, usedExpInput].forEach(el => el.addEventListener('input', updateTotalExperience));
    totalExpInput.addEventListener('input', () => currentExpInput.value = (parseInt(totalExpInput.value) || 0) - (parseInt(usedExpInput.value) || 0));

    // --- УЛУЧШЕНИЯ ХАРАКТЕРИСТИК И НАВЫКОВ ---
    document.querySelectorAll('.improvement-dot').forEach(dot => {
        dot.addEventListener('click', () => {
            const statName = dot.dataset.stat;
            const level = parseInt(dot.dataset.value);
            const aptitudeKey = characteristicToAptitudeMap[statName];
            const aptitudeItem = document.querySelector(`[data-aptitude="${aptitudeKey}"]`);
            const aptitudeCount = aptitudeItem ? aptitudeItem.querySelectorAll('.dot.filled').length : 0;
            const cost = improvementCosts[aptitudeCount] ? improvementCosts[aptitudeCount][level - 1] : Infinity;
            
            if (!dot.classList.contains('filled')) {
                if (spendExperience(cost)) {
                    dot.classList.add('filled');
                    const input = document.getElementById(`stat-${statName}`);
                    input.value = (parseInt(input.value) || 0) + 5;
                    updateCalculatedStats();
                } else {
                    alert('Недостаточно опыта!');
                }
            } else { 
                dot.classList.remove('filled');
                // Логика возврата опыта и снижения статов (закомментирована)
            }
        });
    });

    function handleSkillCheckboxChange(event) {
        const cb = event.target;
        const level = parseInt(cb.dataset.level);
        const characteristic = cb.dataset.characteristic;
        const aptitudeKey = characteristicToAptitudeMap[characteristic];
        const aptitudeItem = document.querySelector(`[data-aptitude="${aptitudeKey}"]`);
        const aptitudeCount = aptitudeItem ? aptitudeItem.querySelectorAll('.dot.filled').length : 0;
        const cost = improvementCosts[aptitudeCount][level - 1];
        if (cb.checked && !spendExperience(cost)) {
            cb.checked = false;
            alert('Недостаточно опыта для улучшения навыка!');
        }
        const valueEl = cb.closest('tr').querySelector(`.skill-value[data-skill="${cb.dataset.skill}"]`);
        if (valueEl.classList.contains('visible')) {
            valueEl.textContent = calculateSkillValue(cb.dataset.skill);
        }
    }
    
    // --- ОЧКИ СУДЬБЫ ---
    const fateMaxInput = document.getElementById('fate-max');
    const fateCurrentInput = document.getElementById('fate-current');
    document.getElementById('fate-increase').addEventListener('click', () => {
        const current = parseInt(fateCurrentInput.value);
        if (current < parseInt(fateMaxInput.value)) fateCurrentInput.value = current + 1;
    });
    document.getElementById('fate-decrease').addEventListener('click', () => {
        const current = parseInt(fateCurrentInput.value);
        if (current > 0) fateCurrentInput.value = current - 1;
    });
    fateMaxInput.addEventListener('change', () => {
        if (parseInt(fateCurrentInput.value) > parseInt(fateMaxInput.value)) fateCurrentInput.value = fateMaxInput.value;
    });

    // --- ПРОРЫВЫ БЕЗДНЫ ---
    const abyssBreakthroughContainer = document.getElementById('abyss-breakthrough-container');
    const arabicToRoman = num => {
        if (isNaN(num) || num < 1) return '';
        const roman = {M:1000,CM:900,D:500,CD:400,C:100,XC:90,L:50,XL:40,X:10,IX:9,V:5,IV:4,I:1};
        let str = '';
        for (let i of Object.keys(roman)) {
            let q = Math.floor(num / roman[i]);
            num -= q * roman[i];
            str += i.repeat(q);
        }
        return str;
    }
    const updateBreakthroughNumbers = () => {
        abyssBreakthroughContainer.querySelectorAll('.breakthrough-item').forEach((item, index) => {
            item.querySelector('.breakthrough-value').textContent = arabicToRoman(index + 1);
        });
    }
    const addAbyssBreakthrough = (data = null) => {
        const item = document.createElement('div');
        item.className = 'breakthrough-item';
        item.innerHTML = `<div class="breakthrough-value"></div><div class="breakthrough-description"><input type="text" placeholder="Описание прорыва" value="${data ? data.description || '' : ''}"></div><button type="button" class="remove-breakthrough-btn" title="Удалить прорыв">×</button>`;
        abyssBreakthroughContainer.appendChild(item);
        item.querySelector('.remove-breakthrough-btn').addEventListener('click', () => {
            item.remove();
            updateBreakthroughNumbers();
        });
        updateBreakthroughNumbers();
    }
    document.querySelector('.add-breakthrough-btn').addEventListener('click', () => addAbyssBreakthrough());
    if (abyssBreakthroughContainer.children.length === 0) addAbyssBreakthrough();
    
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
            talentTabsContainer.querySelector('.active')?.classList.remove('active');
            e.target.classList.add('active');

            document.querySelector('.talent-tab-content.active')?.classList.remove('active');
            document.getElementById(`tab-${tabType}`)?.classList.add('active');
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
                    <input type="text" class="talent-name" value="${data && data.name ? data.name : ''}">
                </div>
                <div>
                    <label>Описание</label>
                    <textarea class="talent-desc">${data && data.description ? data.description : ''}</textarea>
                </div>
                <div>
                    <label>Требование</label>
                    <input type="text" class="talent-req" value="${data && data.requirement ? data.requirement : ''}">
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

        // --- ИНВЕНТАРЬ ---
    const inventoryButton = document.getElementById('inventory-button');
    const inventorySheet = document.getElementById('inventory-sheet');
    const closeInventoryBtn = document.querySelector('.close-inventory-btn');
    const inventoryContainer = document.getElementById('inventory-items-container');
    
    // Открытие/закрытие инвентаря
    inventoryButton.addEventListener('click', () => {
        inventorySheet.classList.remove('hidden');
        // Закрываем таланты, если они открыты
        talentsSheet.classList.add('hidden');
    });
    
    closeInventoryBtn.addEventListener('click', () => {
        inventorySheet.classList.add('hidden');
    });
    
    // Функция добавления предмета в инвентарь
    function addInventoryItem(data = null) {
        const itemId = 'inventory-item-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        const item = document.createElement('div');
        item.className = 'inventory-item';
        item.dataset.id = itemId;
        
        item.innerHTML = `
            <div class="inventory-item-field">
                <label>Наименование</label>
                <input type="text" class="inventory-name" placeholder="Название предмета" value="${data && data.name ? data.name.replace(/"/g, '&quot;') : ''}">
            </div>
            <div class="inventory-item-field">
                <label>Свойства</label>
                <textarea class="inventory-properties" placeholder="Описание, свойства, вес и т.д.">${data && data.properties ? data.properties.replace(/"/g, '&quot;') : ''}</textarea>
            </div>
            <button class="remove-inventory-btn" title="Удалить предмет">×</button>
        `;
        
        inventoryContainer.appendChild(item);
        
        // Добавляем обработчик для удаления
        item.querySelector('.remove-inventory-btn').addEventListener('click', () => {
            item.remove();
        });
    }
    
    // Обработчик для кнопки добавления предмета
    document.querySelector('.add-inventory-btn').addEventListener('click', () => {
        addInventoryItem();
    });
    
    // Добавляем один предмет по умолчанию
    if (inventoryContainer.children.length === 0) {
        addInventoryItem();
    }


    // ==========================================================
    // --- ПОЛНОЦЕННОЕ СОХРАНЕНИЕ И ЗАГРУЗКА (ИСПРАВЛЕНО) ---
    // ==========================================================
    
    function getFormData() {
         const data = {
        inputs: {}, 
        checkboxes: {}, 
        aptitudes: {}, 
        dynamicSkills: {}, 
        improvements: {}, 
        talents: { combat: [], social: [], mental: [] },
        abyssBreakthroughs: [],
        experience: { current: currentExpInput.value, used: usedExpInput.value, total: totalExpInput.value },
        basicInfo: { 
            name: document.getElementById('char-name').value, 
            race: document.getElementById('char-race').value, 
            background: document.getElementById('char-background').value, 
            role: document.getElementById('char-role').value, 
            age: document.getElementById('char-age').value, 
            gender: document.getElementById('char-gender').value 
        },
        appearance: { 
            skin: document.getElementById('char-skin').value, 
            eyes: document.getElementById('char-eyes').value, 
            hair: document.getElementById('char-hair').value, 
            build: document.getElementById('char-build').value 
        },
        vitals: { 
            woundsCurrent: document.getElementById('wounds-current').value, 
            woundsTotal: document.getElementById('wounds-total').value, // ДОБАВЬТЕ ЭТУ СТРОКУ
            fatigueCurrent: fatigueCurrentInput.value 
        },
        avatar: avatarData,
        campaignNotes: document.getElementById('campaign-notes').value || '', // ЗАМЕТКИ ТЕПЕРЬ ЗДЕСЬ
        fatePoints: { 
            current: parseInt(fateCurrentInput.value) || 3, 
            max: parseInt(fateMaxInput.value) || 3 
        },
        abyssPoints: parseInt(document.getElementById('abyss-points').value) || 0,
    };

        document.querySelectorAll('input[type="text"]:not(.talent-name):not(.talent-req), input[type="number"], textarea:not(.talent-desc)').forEach(input => {
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
            if (statInput && statInput.id) {
                const statName = statInput.id.replace('stat-', '');
                data.improvements[statName] = item.querySelectorAll('.improvement-dot.filled').length;
            }
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

                // Сбор данных инвентаря
        data.inventory = [];
        document.querySelectorAll('#inventory-items-container .inventory-item').forEach(item => {
            data.inventory.push({
                name: item.querySelector('.inventory-name').value,
                properties: item.querySelector('.inventory-properties').value
            });
        });
        
        return data;
    }

    function setFormData(data) {
        if (data.inputs) for (const id in data.inputs) if (document.getElementById(id)) document.getElementById(id).value = data.inputs[id];
        if (data.checkboxes) for (const id in data.checkboxes) if (document.getElementById(id)) document.getElementById(id).checked = data.checkboxes[id];
        if (data.basicInfo) for (const key in data.basicInfo) if(document.getElementById(`char-${key}`)) document.getElementById(`char-${key}`).value = data.basicInfo[key];
        if (data.appearance) for (const key in data.appearance) if(document.getElementById(`char-${key}`)) document.getElementById(`char-${key}`).value = data.appearance[key];
            if (data.campaignNotes) {
        document.getElementById('campaign-notes').value = data.campaignNotes;
    } else {
        document.getElementById('campaign-notes').value = ''; // Очищаем если нет заметок
    }
    
        if (data.experience) {
            currentExpInput.value = data.experience.current;
            usedExpInput.value = data.experience.used;
            totalExpInput.value = data.experience.total;
        }

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

                // Загрузка данных инвентаря
        if (data.inventory) {
            inventoryContainer.innerHTML = '';
            if (data.inventory.length > 0) {
                data.inventory.forEach(item => addInventoryItem(item));
            } else {
                addInventoryItem();
            }
        }
        
        if (data.vitals) {
            document.getElementById('wounds-current').value = data.vitals.woundsCurrent || 0;
            document.getElementById('wounds-total').value = data.vitals.woundsTotal || 10; // ДОБАВЬТЕ ЭТУ СТРОКУ
            fatigueCurrentInput.value = data.vitals.fatigueCurrent || 0;
        }

        if (data.avatar) {
            avatarData = data.avatar;
            avatarPlaceholder.style.backgroundImage = `url(${data.avatar})`;
            avatarPlaceholder.classList.add('has-image');
            avatarPlaceholder.querySelector('span').style.display = 'none';
        }

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
                    alert('Ошибка при чтении или обработке файла.');
                }
            };
            reader.readAsText(file);
            event.target.value = '';
        }
    });

    // ПЕРВЫЙ РАСЧЕТ ПРИ ЗАГРУЗКЕ СТРАНИЦЫ
    updateCalculatedStats();

    // Очищаем заметки при первой загрузке страницы
    if (!localStorage.getItem('characterLoaded')) {
        document.getElementById('campaign-notes').value = '';
        localStorage.setItem('characterLoaded', 'true');
    }
});