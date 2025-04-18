import { Plugin } from 'ckeditor5/src/core';
import CharacterLimitEditing from './characterlimitediting';
import CharacterLimitUI from './characterlimitui';

export default class BUFCharacterLimit extends Plugin {
  static get requires() {
    return [CharacterLimitEditing, CharacterLimitUI];
  }

  static get pluginName() {
    return 'BUFCharacterLimit';
  }
}
