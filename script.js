document.addEventListener('DOMContentLoaded', () => {
    // --- ЛОГИКА ДЛЯ СКЛОННОСТЕЙ (исправленная) ---
    const aptitudeItems = document.querySelectorAll('.aptitude-item');
    aptitudeItems.forEach(item => {
        const dots = item.querySelectorAll('.dot');
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                const isFilled = dot.classList.contains('filled');
                
                if (isFilled) {
                    // Убираем только этот кружочек
                    dot.classList.remove('filled');
                } else {
                    // Заполняем все до этого кружочка включительно
                    dots.forEach((d, i) => {
                        if (i <= index) {
                            d.classList.add('filled');
                        } else {
                            d.classList.remove('filled');
                        }
                    });
                }
            });
        });
    });

    const saveButton = document.getElementById('save-button');
    const loadInput = document.getElementById('file-input');
    const notesButton = document.getElementById('notes-button');
    const notesModal = document.getElementById('notes-modal');
    const notesSave = document.getElementById('notes-save');
    const notesCancel = document.getElementById('notes-cancel');
    const campaignNotes = document.getElementById('campaign-notes');

    // --- АВАТАРКА ---
    const avatarPlaceholder = document.getElementById('avatar-placeholder');
    const avatarInput = document.getElementById('avatar-input');
    const avatarUploadBtn = document.getElementById('avatar-upload-btn');
    let avatarData = null;

    avatarUploadBtn.addEventListener('click', () => {
        avatarInput.click();
    });

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

    // --- МОДАЛЬНОЕ ОКНО ЗАМЕТОК ---
    notesButton.addEventListener('click', () => {
        // Загружаем заметки из localStorage
        const savedNotes = localStorage.getItem('campaignNotes');
        if (savedNotes) {
            campaignNotes.value = savedNotes;
        }
        notesModal.style.display = 'block';
    });

    notesSave.addEventListener('click', () => {
        // Сохраняем заметки в localStorage
        localStorage.setItem('campaignNotes', campaignNotes.value);
        notesModal.style.display = 'none';
    });

    notesCancel.addEventListener('click', () => {
        notesModal.style.display = 'none';
    });

    // Закрытие модального окна при клике вне его
    window.addEventListener('click', (event) => {
        if (event.target === notesModal) {
            notesModal.style.display = 'none';
        }
    });

    // --- СКРЫТИЕ/ПОКАЗ НАВЫКОВ ПО ХАРАКТЕРИСТИКАМ ---
    const skillHeaders = document.querySelectorAll('.skill-characteristic-header');
    
    skillHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const characteristic = header.getAttribute('data-characteristic');
            const skillGroup = document.getElementById(`skills-${characteristic}`);
            const toggleIcon = header.querySelector('.toggle-icon');
            
            if (skillGroup.style.display === 'none') {
                skillGroup.style.display = 'block';
                header.classList.add('active');
                toggleIcon.textContent = '▼';
            } else {
                skillGroup.style.display = 'none';
                header.classList.remove('active');
                toggleIcon.textContent = '▶';
            }
        });
    });

    // --- ДИНАМИЧЕСКОЕ ДОБАВЛЕНИЕ СТРОК ДЛЯ НАВЫКОВ ---
    const skillTypes = ['lore-common', 'lore-forbidden', 'linguistics', 'lore-scholastic', 'trade'];
    
    // Переменные для управления модальным окном удаления
    let currentRowToRemove = null;
    let currentSkillTypeToRemove = null;
    const confirmModal = document.getElementById('confirm-modal');
    const confirmYes = document.getElementById('confirm-yes');
    const confirmNo = document.getElementById('confirm-no');
    
    // Настройка модального окна подтверждения
    confirmYes.addEventListener('click', () => {
        if (currentRowToRemove && currentSkillTypeToRemove) {
            currentRowToRemove.remove();
            reindexSkillRows(currentSkillTypeToRemove);
            closeModal();
        }
    });
    
    confirmNo.addEventListener('click', closeModal);
    
    function closeModal() {
        confirmModal.style.display = 'none';
        currentRowToRemove = null;
        currentSkillTypeToRemove = null;
    }
    
    // Функция добавления новой строки навыка
    function addSkillRow(skillType, data = null) {
        const container = document.getElementById(`${skillType}-container`);
        const rowIndex = container.children.length + 1;
        
        const row = document.createElement('tr');
        row.className = 'skill-sub-row';
        row.innerHTML = `
            <td>
                <button type="button" class="remove-skill-btn" title="Удалить навык">×</button>
                <span class="skill-name" data-skill="${skillType}-sub${rowIndex}">${getPlaceholder(skillType)}</span>
                <span class="skill-value" data-skill="${skillType}-sub${rowIndex}"></span>
            </td>
            <td><input type="checkbox" id="${skillType}-sub${rowIndex}-k" data-skill="${skillType}-sub${rowIndex}" data-level="1" data-characteristic="intelligence"></td>
            <td><input type="checkbox" id="${skillType}-sub${rowIndex}-10" data-skill="${skillType}-sub${rowIndex}" data-level="2" data-characteristic="intelligence"></td>
            <td><input type="checkbox" id="${skillType}-sub${rowIndex}-20" data-skill="${skillType}-sub${rowIndex}" data-level="3" data-characteristic="intelligence"></td>
            <td><input type="checkbox" id="${skillType}-sub${rowIndex}-30" data-skill="${skillType}-sub${rowIndex}" data-level="4" data-characteristic="intelligence"></td>
        `;
        
        container.appendChild(row);
        
        // Заполняем данными, если они переданы
        if (data) {
            const nameSpan = row.querySelector('.skill-name');
            nameSpan.textContent = data.name || getPlaceholder(skillType);
            document.getElementById(`${skillType}-sub${rowIndex}-k`).checked = data.k || false;
            document.getElementById(`${skillType}-sub${rowIndex}-10`).checked = data.plus10 || false;
            document.getElementById(`${skillType}-sub${rowIndex}-20`).checked = data.plus20 || false;
            document.getElementById(`${skillType}-sub${rowIndex}-30`).checked = data.plus30 || false;
        }
        
        // Добавляем обработчики для чекбоксов динамических навыков
        const checkboxes = row.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', handleSkillCheckboxChange);
        });
        
        // Добавляем обработчик для кнопки удаления
        row.querySelector('.remove-skill-btn').addEventListener('click', () => {
            currentRowToRemove = row;
            currentSkillTypeToRemove = skillType;
            confirmModal.style.display = 'block';
        });

        // Добавляем обработчик для отображения значения навыка
        const skillName = row.querySelector('.skill-name');
        skillName.addEventListener('click', toggleSkillValueDisplay);
    }
    
    // Функция для получения placeholder в зависимости от типа навыка
    function getPlaceholder(skillType) {
        const placeholders = {
            'lore-common': 'Область знаний...',
            'lore-forbidden': 'Область знаний...',
            'linguistics': 'Язык...',
            'lore-scholastic': 'Область знаний...',
            'trade': 'Вид ремесла...'
        };
        return placeholders[skillType] || 'Название...';
    }
    
    // Функция переиндексации строк после удаления
    function reindexSkillRows(skillType) {
        const container = document.getElementById(`${skillType}-container`);
        const rows = container.querySelectorAll('.skill-sub-row');
        
        rows.forEach((row, index) => {
            const newIndex = index + 1;
            const nameSpan = row.querySelector('.skill-name');
            const valueSpan = row.querySelector('.skill-value');
            const checkboxes = row.querySelectorAll('input[type="checkbox"]');
            
            // Обновляем ID и data-атрибуты
            nameSpan.dataset.skill = `${skillType}-sub${newIndex}`;
            valueSpan.dataset.skill = `${skillType}-sub${newIndex}`;
            
            checkboxes[0].id = `${skillType}-sub${newIndex}-k`;
            checkboxes[1].id = `${skillType}-sub${newIndex}-10`;
            checkboxes[2].id = `${skillType}-sub${newIndex}-20`;
            checkboxes[3].id = `${skillType}-sub${newIndex}-30`;
            
            // Обновляем data-атрибуты
            checkboxes.forEach((checkbox, i) => {
                checkbox.dataset.skill = `${skillType}-sub${newIndex}`;
            });
        });
    }
    
    // Добавляем обработчики для кнопок "Добавить"
    document.querySelectorAll('.add-skill-btn').forEach(button => {
        button.addEventListener('click', () => {
            const skillType = button.getAttribute('data-skill-type');
            addSkillRow(skillType);
        });
    });
    
    // Добавляем по одной пустой строке для каждого типа навыков при загрузке
    skillTypes.forEach(skillType => {
        addSkillRow(skillType);
    });

    // --- СОЮЗНИКИ И ВРАГИ ---
    const alliesContainer = document.getElementById('allies-container');
    const enemiesContainer = document.getElementById('enemies-container');

    function addRelationship(type, data = null) {
        const container = type === 'allies' ? alliesContainer : enemiesContainer;
        const relationshipId = `${type}-${Date.now()}`;
        
        const relationshipItem = document.createElement('div');
        relationshipItem.className = 'relationship-item';
        relationshipItem.innerHTML = `
            <input type="text" placeholder="Имя" value="${data ? data.name || '' : ''}">
            <input type="text" placeholder="Отношение" value="${data ? data.relation || '' : ''}">
            <input type="text" placeholder="Информация" value="${data ? data.info || '' : ''}">
            <button type="button" class="remove-relationship-btn" title="Удалить">×</button>
        `;
        
        container.appendChild(relationshipItem);
        
        // Добавляем обработчик для кнопки удаления
        relationshipItem.querySelector('.remove-relationship-btn').addEventListener('click', () => {
            relationshipItem.remove();
        });
    }

    // Добавляем обработчики для кнопок добавления союзников и врагов
    document.querySelectorAll('.add-relationship-btn').forEach(button => {
        button.addEventListener('click', () => {
            const type = button.getAttribute('data-type');
            addRelationship(type);
        });
    });

    // Добавляем по одному пустому полю для союзников и врагов при загрузке
    addRelationship('allies');
    addRelationship('enemies');

    // --- СКРЫТИЕ/ПОКАЗ СЕКЦИИ СОЮЗНИКОВ И ВРАГОВ ---
    const relationshipsHeader = document.querySelector('.relationships-header');
    
    relationshipsHeader.addEventListener('click', () => {
        const content = document.querySelector('.relationships-content');
        const toggleIcon = relationshipsHeader.querySelector('.toggle-icon');
        
        if (content.style.display === 'none') {
            content.style.display = 'block';
            relationshipsHeader.classList.add('active');
            toggleIcon.textContent = '▼';
        } else {
            content.style.display = 'none';
            relationshipsHeader.classList.remove('active');
            toggleIcon.textContent = '▶';
        }
    });

    // --- БЕЗУМИЕ И ПОРЧА ---
    const mutationsContainer = document.getElementById('mutations-container');
    const corruptionsContainer = document.getElementById('corruptions-container');
    const addMutationBtn = document.querySelector('.add-mutation-btn');
    const addCorruptionBtn = document.querySelector('.add-corruption-btn');

    // Функция добавления мутации
    function addMutation(data = null) {
        const mutationId = `mutation-${Date.now()}`;
        
        const mutationItem = document.createElement('div');
        mutationItem.className = 'mutation-item';
        mutationItem.innerHTML = `
            <input type="text" placeholder="Название мутации" value="${data ? data.name || '' : ''}">
            <input type="text" placeholder="Описание мутации" value="${data ? data.description || '' : ''}">
            <button type="button" class="remove-mutation-btn" title="Удалить мутацию">×</button>
        `;
        
        mutationsContainer.appendChild(mutationItem);
        
        // Добавляем обработчик для кнопки удаления
        mutationItem.querySelector('.remove-mutation-btn').addEventListener('click', () => {
            mutationItem.remove();
        });
    }

    // Функция добавления проявления порчи
    function addCorruption(data = null) {
        const corruptionId = `corruption-${Date.now()}`;
        
        const corruptionItem = document.createElement('div');
        corruptionItem.className = 'corruption-item';
        corruptionItem.innerHTML = `
            <input type="text" placeholder="Название проявления" value="${data ? data.name || '' : ''}">
            <input type="text" placeholder="Описание проявления" value="${data ? data.description || '' : ''}">
            <button type="button" class="remove-corruption-btn" title="Удалить проявление">×</button>
        `;
        
        corruptionsContainer.appendChild(corruptionItem);
        
        // Добавляем обработчик для кнопки удаления
        corruptionItem.querySelector('.remove-corruption-btn').addEventListener('click', () => {
            corruptionItem.remove();
        });
    }

    // Добавляем обработчики для кнопок добавления
    addMutationBtn.addEventListener('click', () => {
        addMutation();
    });

    addCorruptionBtn.addEventListener('click', () => {
        addCorruption();
    });

    // Добавляем по одному пустому полю при загрузке
    addMutation();
    addCorruption();

    // --- СКРЫТИЕ/ПОКАЗ СЕКЦИЙ БЕЗУМИЯ И ПОРЧИ ---
    const madnessHeader = document.querySelector('.madness-header');
    const corruptionHeader = document.querySelector('.corruption-header');
    
    madnessHeader.addEventListener('click', () => {
        const content = document.querySelector('.madness-content');
        const toggleIcon = madnessHeader.querySelector('.toggle-icon');
        
        if (content.style.display === 'none') {
            content.style.display = 'block';
            madnessHeader.classList.add('active');
            toggleIcon.textContent = '▼';
        } else {
            content.style.display = 'none';
            madnessHeader.classList.remove('active');
            toggleIcon.textContent = '▶';
        }
    });
    
    corruptionHeader.addEventListener('click', () => {
        const content = document.querySelector('.corruption-content');
        const toggleIcon = corruptionHeader.querySelector('.toggle-icon');
        
        if (content.style.display === 'none') {
            content.style.display = 'block';
            corruptionHeader.classList.add('active');
            toggleIcon.textContent = '▼';
        } else {
            content.style.display = 'none';
            corruptionHeader.classList.remove('active');
            toggleIcon.textContent = '▶';
        }
    });

    // --- ТАБЛИЦА СТОИМОСТИ УЛУЧШЕНИЙ ---
    const improvementCosts = {
        0: [500, 1000, 2000, 4000, 8000],    // 0 склонностей
        1: [250, 500, 1000, 2000, 4000],     // 1 склонность
        2: [100, 200, 400, 800, 1600]        // 2 склонности
    };

    // --- МАППИНГ ХАРАКТЕРИСТИК ДЛЯ СКЛОННОСТЕЙ ---
    const characteristicToAptitudeMap = {
        'agility': 'ag',
        'strength': 's',
        'perception': 'per',
        'fellowship': 'fel',
        'intelligence': 'int',
        'willpower': 'wp'
    };

    // --- ФУНКЦИИ ДЛЯ РАСЧЕТА ЗНАЧЕНИЙ НАВЫКОВ ---
    function calculateSkillValue(skillName) {
        // Находим все чекбоксы для этого навыка
        const checkboxes = document.querySelectorAll(`input[type="checkbox"][data-skill="${skillName}"]`);
        
        // Определяем уровень прокачки навыка
        let skillBonus = -20; // Базовое значение без прокачки
        
        if (checkboxes[0].checked) skillBonus = 0;   // K
        if (checkboxes[1].checked) skillBonus = 10;  // +10
        if (checkboxes[2].checked) skillBonus = 20;  // +20
        if (checkboxes[3].checked) skillBonus = 30;  // +30
        
        // Получаем характеристику навыка
        const characteristic = checkboxes[0].dataset.characteristic;
        const characteristicInput = document.getElementById(`stat-${characteristic}`);
        const characteristicValue = parseInt(characteristicInput.value) || 0;
        
        // Вычисляем модификатор (первая цифра характеристики)
        const modifier = Math.floor(characteristicValue / 10);
        
        // Итоговое значение: характеристика + бонус навыка + модификатор
        const totalValue = characteristicValue + skillBonus + modifier;
        
        return totalValue;
    }

    function toggleSkillValueDisplay(event) {
        const skillName = event.target.dataset.skill;
        const valueElement = document.querySelector(`.skill-value[data-skill="${skillName}"]`);
        
        if (valueElement.classList.contains('visible')) {
            // Скрываем значение
            valueElement.classList.remove('visible');
        } else {
            // Показываем значение
            const calculatedValue = calculateSkillValue(skillName);
            valueElement.textContent = calculatedValue;
            valueElement.classList.add('visible');
        }
    }

    // Добавляем обработчики для отображения значений навыков
    document.querySelectorAll('.skill-name').forEach(skillName => {
        skillName.addEventListener('click', toggleSkillValueDisplay);
    });

    // --- СИСТЕМА УЛУЧШЕНИЯ ХАРАКТЕРИСТИК (ИСПРАВЛЕННАЯ) ---
    const improvementDots = document.querySelectorAll('.improvement-dot');
    
    improvementDots.forEach(dot => {
        dot.addEventListener('click', () => {
            const isFilled = dot.classList.contains('filled');
            const statName = dot.dataset.stat;
            const improvementLevel = parseInt(dot.dataset.value);
            const statInput = document.getElementById(`stat-${statName}`);
            
            // Получаем количество склонностей для этой характеристики
            const aptitudeKey = characteristicToAptitudeMap[statName];
            const aptitudeItem = document.querySelector(`.aptitude-item[data-aptitude="${aptitudeKey}"]`);
            const aptitudeCount = aptitudeItem ? aptitudeItem.querySelectorAll('.dot.filled').length : 0;
            
            // Получаем стоимость улучшения
            const cost = improvementCosts[aptitudeCount][improvementLevel - 1];
            
            if (!isFilled) {
                // Пытаемся добавить улучшение
                if (canSpendExperience(cost)) {
                    spendExperience(cost);
                    dot.classList.add('filled');
                    const currentValue = parseInt(statInput.value) || 0;
                    statInput.value = currentValue + 5;
                } else {
                    alert('Недостаточно опыта для улучшения!');
                }
            } else {
                // Убираем улучшение (НЕ возвращаем опыт)
                dot.classList.remove('filled');
                // Характеристику не уменьшаем, как требовалось
            }
        });
    });

    // --- СИСТЕМА ОПЫТА С ВОЗМОЖНОСТЬЮ РЕДАКТИРОВАНИЯ ---
    const currentExpInput = document.getElementById('current-exp');
    const usedExpInput = document.getElementById('used-exp');
    const totalExpInput = document.getElementById('total-exp');
    
    // Функция проверки возможности траты опыта
    function canSpendExperience(cost = 0) {
        const currentExp = parseInt(currentExpInput.value) || 0;
        return currentExp >= cost;
    }
    
    // Функция траты опыта
    function spendExperience(cost = 0) {
        const currentExp = parseInt(currentExpInput.value) || 0;
        const usedExp = parseInt(usedExpInput.value) || 0;
        
        if (cost > 0 && currentExp >= cost) {
            currentExpInput.value = currentExp - cost;
            usedExpInput.value = usedExp + cost;
            updateTotalExperience();
            return true;
        }
        return false;
    }
    
    // Функция обновления общего опыта
    function updateTotalExperience() {
        const currentExp = parseInt(currentExpInput.value) || 0;
        const usedExp = parseInt(usedExpInput.value) || 0;
        totalExpInput.value = currentExp + usedExp;
    }
    
    // Обновляем общий опыт при изменении текущего опыта
    currentExpInput.addEventListener('input', updateTotalExperience);
    
    // Обновляем общий опыт при изменении использованного опыта
    usedExpInput.addEventListener('input', updateTotalExperience);
    
    // Обновляем текущий опыт при изменении общего опыта
    totalExpInput.addEventListener('input', () => {
        const totalExp = parseInt(totalExpInput.value) || 0;
        const usedExp = parseInt(usedExpInput.value) || 0;
        currentExpInput.value = totalExp - usedExp;
    });

    // --- ЛОГИКА ДЛЯ НАВЫКОВ ---
    function handleSkillCheckboxChange(event) {
        const checkbox = event.target;
        const isChecked = checkbox.checked;
        const skillName = checkbox.dataset.skill;
        const level = parseInt(checkbox.dataset.level);
        const characteristic = checkbox.dataset.characteristic;
        
        // Получаем количество склонностей для этой характеристики
        const aptitudeKey = characteristicToAptitudeMap[characteristic];
        const aptitudeItem = document.querySelector(`.aptitude-item[data-aptitude="${aptitudeKey}"]`);
        const aptitudeCount = aptitudeItem ? aptitudeItem.querySelectorAll('.dot.filled').length : 0;
        
        // Получаем стоимость улучшения
        const cost = improvementCosts[aptitudeCount][level - 1];
        
        if (isChecked) {
            // Пытаемся добавить улучшение навыка
            if (canSpendExperience(cost)) {
                spendExperience(cost);
                // Галочка ставится автоматически благодаря checked свойству
            } else {
                // Если не хватило опыта, отменяем установку галочки
                checkbox.checked = false;
                alert('Недостаточно опыта для улучшения навыка!');
            }
        } else {
            // Убираем улучшение навыка (НЕ возвращаем опыт)
            // Галочка снимается, но опыт не возвращается
        }

        // Обновляем отображаемое значение навыка, если оно видимо
        const valueElement = document.querySelector(`.skill-value[data-skill="${skillName}"]`);
        if (valueElement.classList.contains('visible')) {
            const calculatedValue = calculateSkillValue(skillName);
            valueElement.textContent = calculatedValue;
        }
    }
    
    // Добавляем обработчики для всех чекбоксов навыков
    document.querySelectorAll('.skills-table input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', handleSkillCheckboxChange);
    });

    // --- ФУНКЦИЯ СБОРА ДАННЫХ ---
    function getFormData() {
        const data = {
            inputs: {},
            checkboxes: {},
            aptitudes: {},
            dynamicSkills: {},
            improvements: {},
            experience: {},
            basicInfo: {},
            appearance: {},
            relationships: {},
            avatar: null,
            campaignNotes: localStorage.getItem('campaignNotes') || ''
        };
        
        // Статические текстовые поля
        document.querySelectorAll('input[type="text"], input[type="number"]').forEach(input => {
            // Пропускаем динамические поля (они собираются отдельно)
            if (!input.id.includes('-sub') && !input.closest('.relationship-item')) {
                data.inputs[input.id] = input.value;
            }
        });
        
        // Статические чекбоксы
        document.querySelectorAll('.skills-table input[type="checkbox"]').forEach(checkbox => {
            // Пропускаем динамические чекбоксы
            if (!checkbox.id.includes('-sub')) {
                data.checkboxes[checkbox.id] = checkbox.checked;
            }
        });
        
        // Склонности
        document.querySelectorAll('.aptitude-item').forEach(item => {
            const aptitudeName = item.dataset.aptitude;
            const filledCount = item.querySelectorAll('.dot.filled').length;
            data.aptitudes[aptitudeName] = filledCount;
        });
        
        // Динамические навыки
        skillTypes.forEach(skillType => {
            data.dynamicSkills[skillType] = [];
            const container = document.getElementById(`${skillType}-container`);
            const rows = container.querySelectorAll('.skill-sub-row');
            
            rows.forEach((row, index) => {
                const rowIndex = index + 1;
                const nameElem = row.querySelector('.skill-name');
                const kElem = document.getElementById(`${skillType}-sub${rowIndex}-k`);
                const plus10Elem = document.getElementById(`${skillType}-sub${rowIndex}-10`);
                const plus20Elem = document.getElementById(`${skillType}-sub${rowIndex}-20`);
                const plus30Elem = document.getElementById(`${skillType}-sub${rowIndex}-30`);
                
                if (nameElem && kElem && plus10Elem && plus20Elem && plus30Elem) {
                    data.dynamicSkills[skillType].push({
                        name: nameElem.textContent,
                        k: kElem.checked,
                        plus10: plus10Elem.checked,
                        plus20: plus20Elem.checked,
                        plus30: plus30Elem.checked
                    });
                }
            });
        });
        
        // Улучшения характеристик
        document.querySelectorAll('.stat-item').forEach(item => {
            const statInput = item.querySelector('input[type="number"]');
            const statName = statInput.id.replace('stat-', '');
            const filledCount = item.querySelectorAll('.improvement-dot.filled').length;
            data.improvements[statName] = filledCount;
        });
        
        // Опыт
        data.experience = {
            current: currentExpInput.value,
            used: usedExpInput.value,
            total: totalExpInput.value
        };

        // Основная информация
        data.basicInfo = {
            name: document.getElementById('char-name').value,
            race: document.getElementById('char-race').value,
            background: document.getElementById('char-background').value,
            role: document.getElementById('char-role').value,
            age: document.getElementById('char-age').value,
            gender: document.getElementById('char-gender').value
        };

        // Внешность
        data.appearance = {
            skin: document.getElementById('char-skin').value,
            eyes: document.getElementById('char-eyes').value,
            hair: document.getElementById('char-hair').value,
            build: document.getElementById('char-build').value
        };

        // Союзники и враги
        data.relationships = {
            allies: Array.from(alliesContainer.querySelectorAll('.relationship-item')).map(item => {
                const inputs = item.querySelectorAll('input');
                return {
                    name: inputs[0].value,
                    relation: inputs[1].value,
                    info: inputs[2].value
                };
            }),
            enemies: Array.from(enemiesContainer.querySelectorAll('.relationship-item')).map(item => {
                const inputs = item.querySelectorAll('input');
                return {
                    name: inputs[0].value,
                    relation: inputs[1].value,
                    info: inputs[2].value
                };
            })
        };

        // Аватар
        data.avatar = avatarData;
        
        // Безумие
        data.madness = {
            points: document.getElementById('madness-points').value || 0,
            mutations: Array.from(mutationsContainer.querySelectorAll('.mutation-item')).map(item => {
                const inputs = item.querySelectorAll('input');
                return {
                    name: inputs[0].value,
                    description: inputs[1].value
                };
            })
        };

        // Порча
        data.corruption = {
            points: document.getElementById('corruption-points').value || 0,
            corruptions: Array.from(corruptionsContainer.querySelectorAll('.corruption-item')).map(item => {
                const inputs = item.querySelectorAll('input');
                return {
                    name: inputs[0].value,
                    description: inputs[1].value
                };
            })
        };

        return data;
    }

    // --- ФУНКЦИЯ ЗАПОЛНЕНИЯ ДАННЫМИ ---
    function setFormData(data) {
        // Статические inputs
        if (data.inputs) {
            for (const id in data.inputs) {
                const element = document.getElementById(id);
                if (element) element.value = data.inputs[id];
            }
        }
        
        // Статические checkboxes
        if (data.checkboxes) {
            for (const id in data.checkboxes) {
                const element = document.getElementById(id);
                if (element) element.checked = data.checkboxes[id];
            }
        }
        
        // Склонности
        if (data.aptitudes) {
            for (const aptitudeName in data.aptitudes) {
                const item = document.querySelector(`.aptitude-item[data-aptitude="${aptitudeName}"]`);
                if (item) {
                    const dots = item.querySelectorAll('.dot');
                    const count = data.aptitudes[aptitudeName];
                    dots.forEach((dot, index) => {
                        dot.classList.toggle('filled', index < count);
                    });
                }
            }
        }
        
        // Динамические навыки
        if (data.dynamicSkills) {
            skillTypes.forEach(skillType => {
                const container = document.getElementById(`${skillType}-container`);
                // Очищаем контейнер
                container.innerHTML = '';
                
                if (data.dynamicSkills[skillType] && data.dynamicSkills[skillType].length > 0) {
                    // Добавляем строки с данными
                    data.dynamicSkills[skillType].forEach(skillData => {
                        addSkillRow(skillType, skillData);
                    });
                } else {
                    // Добавляем одну пустую строку, если нет данных
                    addSkillRow(skillType);
                }
            });
        }
        
        // Улучшения характеристик
        if (data.improvements) {
            for (const statName in data.improvements) {
                const statItem = document.querySelector(`#stat-${statName}`).closest('.stat-item');
                if (statItem) {
                    const dots = statItem.querySelectorAll('.improvement-dot');
                    const count = data.improvements[statName];
                    dots.forEach((dot, index) => {
                        dot.classList.toggle('filled', index < count);
                    });
                }
            }
        }
        
        // Опыт
        if (data.experience) {
            currentExpInput.value = data.experience.current || 0;
            usedExpInput.value = data.experience.used || 0;
            totalExpInput.value = data.experience.total || 0;
        }

        // Основная информация
        if (data.basicInfo) {
            document.getElementById('char-name').value = data.basicInfo.name || '';
            document.getElementById('char-race').value = data.basicInfo.race || '';
            document.getElementById('char-background').value = data.basicInfo.background || '';
            document.getElementById('char-role').value = data.basicInfo.role || '';
            document.getElementById('char-age').value = data.basicInfo.age || '';
            document.getElementById('char-gender').value = data.basicInfo.gender || '';
        }

        // Внешность
        if (data.appearance) {
            document.getElementById('char-skin').value = data.appearance.skin || '';
            document.getElementById('char-eyes').value = data.appearance.eyes || '';
            document.getElementById('char-hair').value = data.appearance.hair || '';
            document.getElementById('char-build').value = data.appearance.build || '';
        }

        // Союзники и враги
        if (data.relationships) {
            // Очищаем контейнеры
            alliesContainer.innerHTML = '';
            enemiesContainer.innerHTML = '';

            // Добавляем союзников
            if (data.relationships.allies) {
                data.relationships.allies.forEach(ally => {
                    if (ally.name || ally.relation || ally.info) addRelationship('allies', ally);
                });
            }

            // Добавляем врагов
            if (data.relationships.enemies) {
                data.relationships.enemies.forEach(enemy => {
                    if (enemy.name || enemy.relation || enemy.info) addRelationship('enemies', enemy);
                });
            }

            // Если нет данных, добавляем пустые поля
            if (!data.relationships.allies || data.relationships.allies.length === 0) {
                addRelationship('allies');
            }
            if (!data.relationships.enemies || data.relationships.enemies.length === 0) {
                addRelationship('enemies');
            }
        }

        // Аватар
        if (data.avatar) {
            avatarData = data.avatar;
            avatarPlaceholder.style.backgroundImage = `url(${data.avatar})`;
            avatarPlaceholder.classList.add('has-image');
            avatarPlaceholder.querySelector('span').style.display = 'none';
        }

        // Заметки
        if (data.campaignNotes) {
            localStorage.setItem('campaignNotes', data.campaignNotes);
        }

        // Безумие
        if (data.madness) {
            document.getElementById('madness-points').value = data.madness.points || 0;
            
            // Очищаем контейнер мутаций
            mutationsContainer.innerHTML = '';
            
            // Добавляем мутации
            if (data.madness.mutations) {
                data.madness.mutations.forEach(mutation => {
                    if (mutation.name || mutation.description) addMutation(mutation);
                });
            }
            
            // Если нет данных, добавляем пустое поле
            if (!data.madness.mutations || data.madness.mutations.length === 0) {
                addMutation();
            }
        }

        // Порча
        if (data.corruption) {
            document.getElementById('corruption-points').value = data.corruption.points || 0;
            
            // Очищаем контейнер проявлений порчи
            corruptionsContainer.innerHTML = '';
            
            // Добавляем проявления порчи
            if (data.corruption.corruptions) {
                data.corruption.corruptions.forEach(corruption => {
                    if (corruption.name || corruption.description) addCorruption(corruption);
                });
            }
            
            // Если нет данных, добавляем пустое поле
            if (!data.corruption.corruptions || data.corruption.corruptions.length === 0) {
                addCorruption();
            }
        }
    }
    
    // --- СОХРАНЕНИЕ В ФАЙЛ ---
    saveButton.addEventListener('click', () => {
        const data = getFormData();
        const dataStr = JSON.stringify(data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const charName = (document.getElementById('char-name').value.trim() || 'character').replace(/[^a-z0-9]/gi, '_');
        a.href = url;
        a.download = `${charName}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    // --- ЗАГРУЗКА ИЗ ФАЙЛА ---
    loadInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    setFormData(data);
                } catch (error) {
                    console.error("Ошибка чтения файла:", error);
                    alert('Ошибка при чтении файла. Убедитесь, что это корректный JSON-файл персонажа.');
                }
            };
            reader.readAsText(file);
            loadInput.value = '';
        }
    });
    
    // Закрытие модального окна при клике вне его
    window.addEventListener('click', (event) => {
        if (event.target === confirmModal) {
            closeModal();
        }
    });
});