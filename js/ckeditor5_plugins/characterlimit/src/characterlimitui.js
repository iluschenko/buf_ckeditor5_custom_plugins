import { Plugin } from 'ckeditor5/src/core';
import { ButtonView } from 'ckeditor5/src/ui';

export default class CharacterLimitUI extends Plugin {
  init() {
    const editor = this.editor;
    const t = editor.t;
    
    // Проверяем конфигурацию
    const enabled = editor.config.get('BUFCharacterLimit.enabled') !== false;
    const showCount = editor.config.get('BUFCharacterLimit.showCharacterCount') !== false;
    const showRemaining = editor.config.get('BUFCharacterLimit.showRemaining') !== false;
    
    if (!enabled || (!showCount && !showRemaining)) {
      return;
    }
    
    const maxChars = editor.config.get('BUFCharacterLimit.maxChars') || 500;
    
    // Создаем кнопку только после полной инициализации редактора
    editor.ui.componentFactory.add('characterCounter', () => {
      const characterCounterView = new ButtonView();
      characterCounterView.set({
        label: '0/' + maxChars,
        tooltip: t('Character count'),
        withText: true,
        class: 'ck-character-counter'
      });
      
      // Применяем стили после рендеринга
      characterCounterView.on('render', () => {
        if (characterCounterView.element) {
          characterCounterView.element.classList.add('ck-character-counter-button');
        }
      });
      
      // Отключаем действие по нажатию
      characterCounterView.on('execute', () => {
        return false;
      });
      
      // Обновляем счетчик при изменении текста
      editor.on('characterCount', (evt, data) => {
        if (!characterCounterView.element) return;
        
        const { characters, remaining } = data;
        const isOverLimit = characters > maxChars;
        
        let counterText = '';
        
        if (showCount && showRemaining) {
          counterText = `${characters}/${maxChars}`;
        } else if (showCount) {
          counterText = `${characters}`;
        } else if (showRemaining) {
          counterText = `${remaining}`;
        }
        
        characterCounterView.set({
          label: counterText
        });
        
        // Добавляем класс при превышении лимита
        if (isOverLimit) {
          characterCounterView.element.classList.add('ck-character-counter--over-limit');
        } else {
          characterCounterView.element.classList.remove('ck-character-counter--over-limit');
        }
      });
      
      return characterCounterView;
    });
  }
}
