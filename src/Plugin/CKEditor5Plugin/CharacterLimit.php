<?php

namespace Drupal\buf_ckeditor5_custom_plugins\Plugin\CKEditor5Plugin;

use Drupal\ckeditor5\Plugin\CKEditor5PluginConfigurableTrait;
use Drupal\ckeditor5\Plugin\CKEditor5PluginDefault;
use Drupal\ckeditor5\Plugin\CKEditor5PluginConfigurableInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\editor\EditorInterface;

/**
 * Implements Character Limit plugin for CKEditor 5.
 *
 * Note: We don't need the CKEditor5Plugin annotation here
 * because we define this plugin in the .ckeditor5.yml file.
 */
class CharacterLimit extends CKEditor5PluginDefault implements CKEditor5PluginConfigurableInterface {
  
  use CKEditor5PluginConfigurableTrait;

  /**
   * {@inheritdoc}
   */
  public function defaultConfiguration() {
    return [
      'enabled' => TRUE,
      'showRemaining' => TRUE,
      'showCharacterCount' => TRUE,
      'maxCharacters' => 500,
      'lockEditor' => TRUE,
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function buildConfigurationForm(array $form, FormStateInterface $form_state) {
    $form['enabled'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Enable the counter'),
      '#default_value' => $this->configuration['enabled'],
    ];
    
    $form['showRemaining'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Show remaining'),
      '#default_value' => $this->configuration['showRemaining'],
    ];
    
    $form['showCharacterCount'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Show the characters count'),
      '#default_value' => $this->configuration['showCharacterCount'],
    ];
    
    $form['maxCharacters'] = [
      '#type' => 'number',
      '#title' => $this->t('Maximum characters limit'),
      '#default_value' => $this->configuration['maxCharacters'],
      '#min' => 1,
    ];
    
    $form['lockEditor'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Lock editor when limit is reached'),
      '#default_value' => $this->configuration['lockEditor'],
    ];
    
    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function validateConfigurationForm(array &$form, FormStateInterface $form_state) {
    $maxCharacters = $form_state->getValue('maxCharacters');
    if (!is_numeric($maxCharacters) || $maxCharacters <= 0) {
      $form_state->setError($form['maxCharacters'], $this->t('Maximum characters must be a positive number.'));
    }
  }

  /**
   * {@inheritdoc}
   */
  public function submitConfigurationForm(array &$form, FormStateInterface $form_state) {
    $this->configuration['enabled'] = $form_state->getValue('enabled');
    $this->configuration['showRemaining'] = $form_state->getValue('showRemaining');
    $this->configuration['showCharacterCount'] = $form_state->getValue('showCharacterCount');
    $this->configuration['maxCharacters'] = $form_state->getValue('maxCharacters');
    $this->configuration['lockEditor'] = $form_state->getValue('lockEditor');
  }

  /**
   * {@inheritdoc}
   */
  public function getDynamicPluginConfig(array $static_plugin_config, EditorInterface $editor): array {
    $config = $this->getConfiguration();
    
    return [
      'BUFCharacterLimit' => [
        'enabled' => $config['enabled'],
        'showRemaining' => $config['showRemaining'],
        'showCharacterCount' => $config['showCharacterCount'],
        'maxChars' => $config['maxCharacters'],
        'lockEditor' => $config['lockEditor'],
      ],
    ];
  }
}
