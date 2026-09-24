import { LitElement, html, css } from 'lit';

console.info('%c GSM2MQTT-DASHBOARD %c v1.3.0 ', 'color: white; background: #03a9f4; font-weight: 700; border-radius: 3px 0 0 3px;', 'color: #03a9f4; background: #e1f5fe; font-weight: 700; border-radius: 0 3px 3px 0;');

class GSM2MQTTCard extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
      _ussdWaiting: { state: true },
      _ussdResponse: { state: true },
      _activePanel: { state: true },
      _tariffSavedNotice: { state: true },
    };
  }

  static get styles() {
    return css`
      :host {
        display: block;
      }
      ha-card {
        padding: 0;
      }
      .card-content {
        padding: 0 16px 16px;
        font-family: var(--paper-font-body1_-_font-family, sans-serif);
      }
      .offline-banner {
        background: rgba(198, 40, 40, 0.15);
        color: var(--error-color, #c62828);
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 0.85em;
        font-weight: 600;
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        gap: 8px;
        border: 1px solid rgba(198, 40, 40, 0.3);
      }
      .status-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        margin-bottom: 12px;
      }
      .metric-box {
        background: var(--secondary-background-color, #f5f5f5);
        padding: 8px 12px;
        border-radius: 8px;
      }
      .metric-title {
        font-size: 0.8em;
        color: var(--secondary-text-color, #727272);
      }
      .metric-val {
        font-size: 1.15em;
        font-weight: bold;
        margin-top: 4px;
        color: var(--primary-text-color, #212121);
      }
      .badge {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 0.8em;
        font-weight: bold;
        margin-top: 4px;
      }
      .badge-ready {
        background: rgba(46, 125, 50, 0.2);
        color: #2e7d32;
      }
      .badge-error {
        background: rgba(198, 40, 40, 0.2);
        color: #c62828;
      }
      .badge-offline {
        background: rgba(117, 117, 117, 0.2);
        color: #757575;
      }
      .tariff-box {
        background: var(--secondary-background-color, #f5f5f5);
        padding: 10px 12px;
        border-radius: 8px;
        margin-bottom: 12px;
      }
      .tariff-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.85em;
        font-weight: 600;
        color: var(--primary-text-color, #212121);
      }
      .tariff-val {
        font-size: 1.1em;
        font-weight: bold;
        color: var(--primary-text-color, #212121);
      }
      .tariff-sub {
        font-size: 0.75em;
        color: var(--secondary-text-color, #727272);
        margin-top: 4px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .progress-container {
        background: var(--divider-color, rgba(0, 0, 0, 0.1));
        border-radius: 4px;
        height: 8px;
        width: 100%;
        overflow: hidden;
        margin-top: 6px;
      }
      .progress-bar {
        height: 100%;
        border-radius: 4px;
        transition: width 0.3s ease, background-color 0.3s ease;
      }
      .tools-bar {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-top: 12px;
        padding-top: 10px;
        border-top: 1px solid var(--divider-color, #e0e0e0);
      }
      .tool-toggle-btn {
        padding: 5px 10px;
        font-size: 0.8em;
        font-weight: 500;
        border-radius: 14px;
        background: var(--secondary-background-color, #f5f5f5);
        color: var(--primary-text-color, #212121);
        border: 1px solid var(--divider-color, #e0e0e0);
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        transition: all 0.2s ease;
      }
      .tool-toggle-btn:hover {
        background: var(--divider-color, #e0e0e0);
      }
      .tool-toggle-btn.active {
        background: var(--primary-color, #03a9f4);
        color: var(--text-primary-color, #fff);
        border-color: var(--primary-color, #03a9f4);
      }
      .tool-panel {
        background: var(--card-background-color, #fff);
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 8px;
        padding: 10px 12px;
        margin-top: 10px;
      }
      .input-row {
        display: flex;
        gap: 8px;
        margin-top: 8px;
      }
      input, textarea {
        width: 100%;
        padding: 8px;
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 6px;
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color, #212121);
        font-family: inherit;
        box-sizing: border-box;
      }
      button {
        padding: 8px 16px;
        background: var(--primary-color, #03a9f4);
        color: var(--text-primary-color, #fff);
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 500;
        transition: opacity 0.2s;
      }
      button:hover:not(:disabled) {
        opacity: 0.85;
      }
      button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      button.btn-danger {
        background: var(--error-color, #c62828);
      }
      button.btn-success {
        background: var(--success-color, #2e7d32);
      }
      .section-title {
        font-weight: 600;
        font-size: 0.95em;
        margin: 10px 0 4px;
        display: flex;
        align-items: center;
        gap: 6px;
        color: var(--primary-text-color, #212121);
      }
      .quick-btn {
        padding: 3px 8px;
        font-size: 0.75em;
        background: var(--secondary-background-color, #f5f5f5);
        color: var(--primary-text-color, #212121);
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 4px;
        cursor: pointer;
      }
      .quick-btn:hover {
        background: var(--divider-color, #e0e0e0);
      }
      .inbox-box, .ussd-box {
        font-size: 0.85em;
        padding: 8px;
        background: var(--secondary-background-color, #f5f5f5);
        border-radius: 6px;
        min-height: 28px;
        color: var(--primary-text-color, #212121);
      }
      .ussd-box {
        margin-top: 6px;
        border-left: 3px solid var(--primary-color, #03a9f4);
      }
      .recipient-list {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-top: 6px;
        min-height: 24px;
      }
      .recipient-tag {
        background: var(--secondary-background-color, #f5f5f5);
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 16px;
        padding: 4px 10px;
        font-size: 0.85em;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        color: var(--primary-text-color, #212121);
      }
      .recipient-del {
        cursor: pointer;
        color: var(--error-color, #c62828);
        font-weight: bold;
        font-size: 1.1em;
        line-height: 1;
        padding: 0 2px;
      }
      .recipient-del:hover {
        opacity: 0.7;
      }
      .mb-1 {
        margin-bottom: 6px;
      }
    `;
  }

  setConfig(config) {
    this.config = {
      title: 'GSM2MQTT Dashboard',
      topic_prefix: 'gsm2mqtt',
      modem_id: '',
      show_tariff: true,
      show_last_sms: true,
      show_tools: true,
      show_sms: false,
      show_ussd: false,
      show_call: false,
      show_recipients: false,
      show_tariff_editor: false,
      ...config
    };
  }

  _getModemId() {
    if (this.config && this.config.modem_id) {
      return this.config.modem_id;
    }
    if (!this.hass || !this.hass.states) {
      return 'gsm_modem';
    }
    // Check known entities for modem_id in attributes
    const candidateEntities = [
      this.hass.states['sensor.gsm_modem_status'],
      this.hass.states['sensor.gsm_modem_last_sms'],
      this.hass.states['sensor.gsm_modem_signal'],
    ];
    for (const ent of candidateEntities) {
      if (ent && ent.attributes && ent.attributes.modem_id) {
        return ent.attributes.modem_id;
      }
    }
    // Scan all sensor states for modem_id attribute
    for (const [key, state] of Object.entries(this.hass.states)) {
      if ((key.startsWith('sensor.') || key.startsWith('binary_sensor.')) && key.includes('gsm')) {
        if (state && state.attributes && state.attributes.modem_id) {
          return state.attributes.modem_id;
        }
      }
    }
    return 'gsm_modem';
  }

  _resolveEntity(type, keywords) {
    if (!this.hass || !this.config) return null;
    const modemId = (this.config.modem_id || '').toLowerCase();

    // 1. Direct configuration override from card YAML: entities.sms, entities.balance, etc.
    if (this.config.entities && this.config.entities[type]) {
      return this.hass.states[this.config.entities[type]] || null;
    }

    const states = this.hass.states;
    if (!states) return null;

    // 2. If modem_id is explicitly configured (e.g. "modem2", "siemens_mc35i"):
    if (modemId) {
      for (const kw of keywords) {
        const candidateKeys = [
          `sensor.${modemId}_${kw}`,
          `sensor.gsm_modem_${modemId}_${kw}`,
          `binary_sensor.${modemId}_${kw}`,
        ];
        for (const k of candidateKeys) {
          if (states[k]) return states[k];
        }
      }
    }

    // 3. Option B Standard naming: sensor.gsm_modem_<keyword> (for slot 1 / single modem)
    if (!modemId || modemId === '1' || modemId === 'gsm_modem') {
      for (const kw of keywords) {
        const optBKey = `sensor.gsm_modem_${kw}`;
        if (states[optBKey]) return states[optBKey];
        const binKey = `binary_sensor.gsm_modem_${kw}`;
        if (states[binKey]) return states[binKey];
      }
    }

    // 4. If slot number specified (e.g. "2"): sensor.gsm_modem_2_<keyword>
    if (/^\d+$/.test(modemId)) {
      const slotNum = modemId;
      for (const kw of keywords) {
        const slotKey = `sensor.gsm_modem_${slotNum}_${kw}`;
        if (states[slotKey]) return states[slotKey];
        const binSlotKey = `binary_sensor.gsm_modem_${slotNum}_${kw}`;
        if (states[binSlotKey]) return states[binSlotKey];
      }
    }

    // 5. Search by tokens if modemId provided
    if (modemId) {
      const idParts = modemId.split(/[^a-z0-9]/).filter(p => p.length >= 3);
      for (const key of Object.keys(states)) {
        if (!key.startsWith('sensor.') && !key.startsWith('binary_sensor.')) continue;
        const lowerKey = key.toLowerCase();
        const entity = states[key];
        const friendlyName = ((entity.attributes && entity.attributes.friendly_name) || '').toLowerCase();

        const matchesKeyword = keywords.some(kw => lowerKey.includes(kw) || friendlyName.includes(kw));
        if (!matchesKeyword) continue;

        const matchesModem = lowerKey.includes(modemId) || idParts.some(p => lowerKey.includes(p) || friendlyName.includes(p));
        if (matchesModem) {
          return entity;
        }
      }
    }

    // 6. Universal Fallback across all sensors by keyword (for single GSM modem setups)
    for (const key of Object.keys(states)) {
      if (!key.startsWith('sensor.') && !key.startsWith('binary_sensor.')) continue;
      const lowerKey = key.toLowerCase();
      const entity = states[key];
      const friendlyName = ((entity.attributes && entity.attributes.friendly_name) || '').toLowerCase();

      const matchesKeyword = keywords.some(kw => lowerKey.includes(kw) || friendlyName.includes(kw));
      if (matchesKeyword) {
        return entity;
      }
    }

    return null;
  }

  _publishMqtt(subTopic, payload) {
    if (!this.hass) return;
    const modemId = this._getModemId();
    const topic = `${this.config.topic_prefix}/modem/${modemId}/${subTopic}`;
    this.hass.callService('mqtt', 'publish', {
      topic: topic,
      payload: payload
    });
  }

  _togglePanel(panel) {
    this._activePanel = this._activePanel === panel ? null : panel;
  }

  _handleUssd(e) {
    const input = this.shadowRoot.getElementById('ussdInput');
    if (input && input.value) {
      const code = input.value.trim();
      this._publishMqtt('ussd/send', JSON.stringify({ code: code }));
      this._ussdWaiting = true;
      if (this._ussdTimer) clearTimeout(this._ussdTimer);
      this._ussdTimer = setTimeout(() => {
        if (this._ussdWaiting) {
          this._ussdWaiting = false;
          this.requestUpdate();
        }
      }, 15000);
      this.requestUpdate();
    }
  }

  _setUssd(val) {
    const input = this.shadowRoot.getElementById('ussdInput');
    if (input) input.value = val;
  }

  _handleSms() {
    const to = (this.shadowRoot.getElementById('smsTo').value || '').trim();
    const text = (this.shadowRoot.getElementById('smsText').value || '').trim();
    if (text) {
      this._publishMqtt('sms/send', JSON.stringify({ to, text, request_report: true }));
      this.shadowRoot.getElementById('smsText').value = '';
    }
  }

  _getRecipients() {
    if (!this.hass || !this.hass.states) return [];
    let state = this.hass.states['text.gsm2mqtt_gateway_recipients'] ||
                this.hass.states['text.gsm_gateway_recipients'];
    if (!state) {
      for (const [key, ent] of Object.entries(this.hass.states)) {
        if (key.includes('recipients')) {
          state = ent;
          break;
        }
      }
    }
    if (!state || !state.state || state.state === 'unavailable' || state.state === 'unknown') {
      return [];
    }
    return state.state.split(',').map(s => s.trim()).filter(s => s.length > 0);
  }

  _handleAddRecipient() {
    const input = this.shadowRoot.getElementById('newRecipientInput');
    if (!input || !input.value.trim()) return;
    const num = input.value.trim();
    if (!this.hass) return;
    const prefix = this.config.topic_prefix || 'gsm2mqtt';
    this.hass.callService('mqtt', 'publish', {
      topic: `${prefix}/config/recipients/add`,
      payload: JSON.stringify({ number: num }),
    });
    input.value = '';
  }

  _handleRemoveRecipient(num) {
    if (!this.hass) return;
    const prefix = this.config.topic_prefix || 'gsm2mqtt';
    this.hass.callService('mqtt', 'publish', {
      topic: `${prefix}/config/recipients/remove`,
      payload: JSON.stringify({ number: num }),
    });
  }

  _handleCall() {
    const num = this.shadowRoot.getElementById('callNumber').value;
    if (num) {
      this._publishMqtt('call/dial', JSON.stringify({ number: num }));
    }
  }

  _handleHangup() {
    this._publishMqtt('call/hangup', '{}');
  }

  _handleSaveTariff() {
    const smsLimitInput = this.shadowRoot.getElementById('tariffSmsLimit');
    const smsUsedInput = this.shadowRoot.getElementById('tariffSmsUsed');
    const callLimitInput = this.shadowRoot.getElementById('tariffCallLimit');
    const callUsedInput = this.shadowRoot.getElementById('tariffCallUsed');
    const dataLimitInput = this.shadowRoot.getElementById('tariffDataLimit');
    const dataUsedInput = this.shadowRoot.getElementById('tariffDataUsed');
    const resetDayInput = this.shadowRoot.getElementById('tariffResetDay');
    const ussdInput = this.shadowRoot.getElementById('tariffBalanceUssd');

    const payload = {};
    if (smsLimitInput && smsLimitInput.value !== '') {
      payload.sms_limit = parseInt(smsLimitInput.value, 10);
    }
    if (smsUsedInput && smsUsedInput.value !== '') {
      payload.sms_month_count = parseInt(smsUsedInput.value, 10);
    }
    if (callLimitInput && callLimitInput.value !== '') {
      payload.call_minutes_limit = parseFloat(callLimitInput.value);
    }
    if (callUsedInput && callUsedInput.value !== '') {
      payload.call_minutes_used = parseFloat(callUsedInput.value);
    }
    if (dataLimitInput && dataLimitInput.value !== '') {
      payload.data_traffic_limit_mb = parseInt(dataLimitInput.value, 10);
    }
    if (dataUsedInput && dataUsedInput.value !== '') {
      payload.data_bytes_used = Math.round(parseFloat(dataUsedInput.value) * 1048576);
    }
    if (resetDayInput && resetDayInput.value !== '') {
      payload.reset_day_of_month = parseInt(resetDayInput.value, 10);
    }
    if (ussdInput && ussdInput.value.trim() !== '') {
      payload.balance_ussd = ussdInput.value.trim();
    }

    this._publishMqtt('tariff/set', JSON.stringify(payload));
    this._tariffSavedNotice = 'Настройки тарифа сохранены!';
    setTimeout(() => {
      this._tariffSavedNotice = '';
      this.requestUpdate();
    }, 4000);
    this.requestUpdate();
  }

  _handleResetTariff() {
    if (window.confirm('Сбросить счетчики расхода тарифа за текущий месяц?')) {
      this._publishMqtt('tariff/reset', '{}');
      this._tariffSavedNotice = 'Счетчики тарифа сброшены!';
      setTimeout(() => {
        this._tariffSavedNotice = '';
        this.requestUpdate();
      }, 4000);
      this.requestUpdate();
    }
  }

  render() {
    if (!this.config || !this.hass) {
      return html``;
    }

    // Smart resolve all entities
    const balanceState = this._resolveEntity('balance', ['balance']);
    const signalState = this._resolveEntity('signal', ['signal', 'signal_strength', 'signal_dbm']);
    const operatorState = this._resolveEntity('operator', ['operator']);
    const lastSmsState = this._resolveEntity('sms', ['last_sms', 'last_incoming_sms', 'incoming_sms', 'sms']);
    const statusState = this._resolveEntity('status', ['status', 'health']);
    const ussdState = this._resolveEntity('ussd', ['ussd_response', 'ussd']);
    const tariffSmsState = this._resolveEntity('tariff_sms', ['sms_remaining', 'tariff']);
    const tariffCallState = this._resolveEntity('tariff_calls', ['call_minutes_remaining', 'call_minutes']);

    // Check offline status
    const isOffline = !statusState ||
      statusState.state === 'unavailable' ||
      statusState.state === 'offline' ||
      statusState.state === 'error' ||
      statusState.state === 'unknown';

    const balance = balanceState && balanceState.state !== 'unknown' && balanceState.state !== 'unavailable'
      ? `${balanceState.state} ${balanceState.attributes.unit_of_measurement || 'RUB'}`
      : 'N/A';

    let signal = 'N/A';
    if (signalState && signalState.state !== 'unknown' && signalState.state !== 'unavailable') {
      const unit = signalState.attributes.unit_of_measurement || 'dBm';
      signal = `${signalState.state} ${unit}`;
    }

    const operator = operatorState && operatorState.state !== 'unknown' && operatorState.state !== 'unavailable'
      ? operatorState.state
      : '-';

    let statusText = 'OFFLINE';
    let statusClass = 'badge-offline';
    if (statusState && statusState.state !== 'unavailable' && statusState.state !== 'unknown') {
      const st = statusState.state.toUpperCase();
      if (st === 'READY') {
        statusText = 'READY';
        statusClass = 'badge-ready';
      } else if (st === 'ERROR' || st === 'OFFLINE') {
        statusText = st;
        statusClass = 'badge-error';
      } else {
        statusText = st;
        statusClass = 'badge-error';
      }
    }

    // Auto-clear waiting state when USSD is detected
    if (ussdState && ussdState.state && ussdState.state !== 'unknown' && ussdState.state !== 'unavailable') {
      this._ussdWaiting = false;
    }

    // USSD response display
    let ussdResponseHtml = html``;
    if (ussdState && ussdState.state && ussdState.state !== 'unknown' && ussdState.state !== 'unavailable') {
      ussdResponseHtml = html`
        <div class="ussd-box">
          <div style="font-size:0.75em; color:var(--secondary-text-color, #727272); font-weight:600;">Ответ сети (USSD):</div>
          <div style="margin-top:2px;">${ussdState.state}</div>
        </div>
      `;
    } else if (this._ussdWaiting) {
      ussdResponseHtml = html`
        <div class="ussd-box" style="border-left-color: var(--warning-color, #ff9800);">
          <div style="font-size:0.75em; color:var(--warning-color, #ff9800); font-weight:600;">USSD Запрос отправлен...</div>
          <div style="margin-top:2px;">Ожидание ответа сети (текст или SMS)...</div>
        </div>
      `;
    }

    // Tariff SMS quota display
    const showTariff = this.config.show_tariff !== false;
    let tariffHtml = html``;
    if (showTariff && tariffSmsState && tariffSmsState.state !== 'unavailable' && tariffSmsState.state !== 'unknown') {
      const remainingStr = tariffSmsState.state;
      const limit = Number(tariffSmsState.attributes?.sms_limit ?? 0);
      const monthCount = Number(tariffSmsState.attributes?.sms_month_count ?? 0);
      const dayCount = Number(tariffSmsState.attributes?.sms_day_count ?? 0);
      const resetDay = tariffSmsState.attributes?.reset_day_of_month || 1;

      if (limit > 0) {
        const remaining = Number(remainingStr) || 0;
        const percent = Math.min(100, Math.max(0, Math.round((remaining / limit) * 100)));
        let barColor = 'var(--success-color, #2e7d32)';
        if (percent <= 15) {
          barColor = 'var(--error-color, #c62828)';
        } else if (percent <= 40) {
          barColor = 'var(--warning-color, #ff9800)';
        }

        tariffHtml = html`
          <div class="tariff-box">
            <div class="tariff-header">
              <span>📊 Лимит тарифа (SMS)</span>
              <span class="tariff-val">${remaining} / ${limit}</span>
            </div>
            <div class="progress-container">
              <div class="progress-bar" style="width: ${percent}%; background-color: ${barColor};"></div>
            </div>
            <div class="tariff-sub">
              <span>Использовано: ${monthCount} шт. (сегодня: ${dayCount})</span>
              <span>Сброс: ${resetDay}-го числа</span>
            </div>
          </div>
        `;
      } else {
        tariffHtml = html`
          <div class="tariff-box">
            <div class="tariff-header">
              <span>📊 Лимит тарифа (SMS)</span>
              <span class="tariff-val" style="font-size:0.95em;">Без ограничений</span>
            </div>
            <div class="tariff-sub">
              <span>Отправлено за месяц: ${monthCount} шт. (сегодня: ${dayCount})</span>
              <span>Лимит не задан</span>
            </div>
          </div>
        `;
      }
    }

    // Tariff Calls display (optional, if callLimit > 0 or callUsed > 0)
    let tariffCallsHtml = html``;
    if (showTariff && tariffCallState && tariffCallState.state !== 'unavailable' && tariffCallState.state !== 'unknown') {
      const callLimit = Number(tariffCallState.attributes?.call_minutes_limit ?? 0);
      const callUsed = Number(tariffCallState.attributes?.call_minutes_used ?? tariffCallState.attributes?.call_minutes_month_count ?? 0);
      const resetDay = tariffCallState.attributes?.reset_day_of_month || tariffSmsState?.attributes?.reset_day_of_month || 1;

      if (callLimit > 0) {
        const callRemaining = Number(tariffCallState.state) || 0;
        const percent = Math.min(100, Math.max(0, Math.round((callRemaining / callLimit) * 100)));
        let barColor = 'var(--success-color, #2e7d32)';
        if (percent <= 15) barColor = 'var(--error-color, #c62828)';
        else if (percent <= 40) barColor = 'var(--warning-color, #ff9800)';

        tariffCallsHtml = html`
          <div class="tariff-box" style="margin-top:-6px;">
            <div class="tariff-header">
              <span>📞 Лимит звонков (минуты)</span>
              <span class="tariff-val">${callRemaining} / ${callLimit} мин</span>
            </div>
            <div class="progress-container">
              <div class="progress-bar" style="width: ${percent}%; background-color: ${barColor};"></div>
            </div>
            <div class="tariff-sub">
              <span>Использовано: ${callUsed} мин.</span>
              <span>Сброс: ${resetDay}-го числа</span>
            </div>
          </div>
        `;
      } else if (callUsed > 0) {
        tariffCallsHtml = html`
          <div class="tariff-box" style="margin-top:-6px;">
            <div class="tariff-header">
              <span>📞 Лимит звонков (минуты)</span>
              <span class="tariff-val" style="font-size:0.95em;">Без ограничений</span>
            </div>
            <div class="tariff-sub">
              <span>Использовано за месяц: ${callUsed} мин.</span>
              <span>Лимит не задан</span>
            </div>
          </div>
        `;
      }
    }

    // Tariff Data Traffic display (optional, if dataLimitMB > 0 or dataBytesUsed > 0)
    let tariffDataHtml = html``;
    const dataLimitMB = Number(tariffSmsState?.attributes?.data_traffic_limit_mb ?? 0);
    const dataBytesUsed = Number(tariffSmsState?.attributes?.data_bytes_used ?? 0);
    const dataBytesRem = Number(tariffSmsState?.attributes?.data_bytes_remaining ?? 0);
    const resetDay = tariffSmsState?.attributes?.reset_day_of_month || 1;

    if (showTariff && (dataLimitMB > 0 || dataBytesUsed > 0)) {
      const dataUsedMB = (dataBytesUsed / 1048576).toFixed(1);
      const dataRemMB = (dataBytesRem / 1048576).toFixed(1);

      if (dataLimitMB > 0) {
        const percent = Math.min(100, Math.max(0, Math.round((dataBytesRem / (dataLimitMB * 1048576)) * 1048576 > 0 ? (dataBytesRem / (dataLimitMB * 1048576)) * 100 : 0)));
        let barColor = 'var(--success-color, #2e7d32)';
        if (percent <= 15) barColor = 'var(--error-color, #c62828)';
        else if (percent <= 40) barColor = 'var(--warning-color, #ff9800)';

        tariffDataHtml = html`
          <div class="tariff-box" style="margin-top:-6px;">
            <div class="tariff-header">
              <span>🌐 Лимит трафика (интернет)</span>
              <span class="tariff-val">${dataRemMB} / ${dataLimitMB} MB</span>
            </div>
            <div class="progress-container">
              <div class="progress-bar" style="width: ${percent}%; background-color: ${barColor};"></div>
            </div>
            <div class="tariff-sub">
              <span>Использовано: ${dataUsedMB} MB</span>
              <span>Сброс: ${resetDay}-го числа</span>
            </div>
          </div>
        `;
      } else {
        tariffDataHtml = html`
          <div class="tariff-box" style="margin-top:-6px;">
            <div class="tariff-header">
              <span>🌐 Лимит трафика (интернет)</span>
              <span class="tariff-val" style="font-size:0.95em;">Без ограничений</span>
            </div>
            <div class="tariff-sub">
              <span>Использовано за месяц: ${dataUsedMB} MB</span>
              <span>Лимит не задан</span>
            </div>
          </div>
        `;
      }
    }

    // Last incoming SMS display
    const showLastSms = this.config.show_last_sms !== false;
    let lastSmsHtml = html`Нет входящих сообщений`;
    if (lastSmsState && lastSmsState.state !== 'unknown' && lastSmsState.state !== 'unavailable') {
      const from = (lastSmsState.attributes && lastSmsState.attributes.from) || 'Отправитель';
      const time = (lastSmsState.attributes && lastSmsState.attributes.timestamp) ? ` (${lastSmsState.attributes.timestamp})` : '';
      const text = lastSmsState.state || (lastSmsState.attributes && lastSmsState.attributes.text) || '';
      if (text) {
        lastSmsHtml = html`
          <div><strong>${from}${time}:</strong></div>
          <div style="margin-top:2px;">${text}</div>
        `;
      }
    }

    const recipients = this._getRecipients();

    // Determine panel visibility (via config flags or interactive toggle button)
    const isSmsVisible = this.config.show_sms || this._activePanel === 'sms';
    const isUssdVisible = this.config.show_ussd || this._activePanel === 'ussd';
    const isCallVisible = this.config.show_call || this._activePanel === 'call';
    const isRecipientsVisible = this.config.show_recipients || this._activePanel === 'recipients';
    const isTariffEditorVisible = this.config.show_tariff_editor || this._activePanel === 'tariff';
    const showTools = this.config.show_tools !== false;

    return html`
      <ha-card header="${this.config.title}">
        <div class="card-content">

          ${isOffline ? html`
            <div class="offline-banner">
              <span>⚠️</span>
              <span>Шлюз GSM2MQTT или модем не подключен (Offline)</span>
            </div>
          ` : html``}

          <!-- Status & Balance, Signal & Operator -->
          <div class="status-row">
            <div class="metric-box">
              <div class="metric-title">Статус & Баланс</div>
              <div class="metric-val">${balance}</div>
              <div class="badge ${statusClass}">${statusText}</div>
            </div>
            <div class="metric-box">
              <div class="metric-title">Сигнал & Оператор</div>
              <div class="metric-val">${signal}</div>
              <div class="metric-title" style="margin-top:4px;">${operator}</div>
            </div>
          </div>

          <!-- Tariff remaining quota progress bar -->
          ${tariffHtml}
          ${tariffCallsHtml}
          ${tariffDataHtml}

          <!-- Last incoming SMS -->
          ${showLastSms ? html`
            <div class="section-title">📥 Последнее сообщение</div>
            <div class="inbox-box">
              ${lastSmsHtml}
            </div>
          ` : html``}

          <!-- Interactive Action Panels (Modular) -->

          <!-- USSD Panel -->
          ${isUssdVisible ? html`
            <div class="tool-panel">
              <div class="section-title">⚡ USSD Запрос</div>
              <div class="input-row">
                <input type="text" id="ussdInput" value="*100#">
                <button @click="${this._handleUssd}" ?disabled="${isOffline}">Запрос</button>
              </div>
              <div style="display:flex; flex-wrap:wrap; gap:6px; margin-top:4px;">
                <span class="quick-btn" @click="${() => this._setUssd('*100#')}">*100# Баланс</span>
                <span class="quick-btn" @click="${() => this._setUssd('*558#')}">*558# Остатки</span>
                <span class="quick-btn" @click="${() => this._setUssd('*105#')}">*105# Тариф</span>
              </div>
              ${ussdResponseHtml}
            </div>
          ` : html``}

          <!-- Send SMS Panel -->
          ${isSmsVisible ? html`
            <div class="tool-panel">
              <div class="section-title">✉️ Отправить SMS</div>
              <input type="text" id="smsTo" class="mb-1" placeholder="+79001234567 (пусто — всем получателям)">
              <textarea id="smsText" rows="2" placeholder="Текст сообщения..."></textarea>
              <div class="input-row" style="justify-content:flex-end;">
                <button @click="${this._handleSms}" ?disabled="${isOffline}">Отправить</button>
              </div>
            </div>
          ` : html``}

          <!-- Recipients Panel -->
          ${isRecipientsVisible ? html`
            <div class="tool-panel">
              <div class="section-title">👥 Номера для оповещений (Recipients)</div>
              <div class="recipient-list">
                ${recipients.map(num => html`
                  <span class="recipient-tag">
                    <span>📞 ${num}</span>
                    <span class="recipient-del" title="Удалить номер" @click="${() => this._handleRemoveRecipient(num)}">✕</span>
                  </span>
                `)}
                ${recipients.length === 0 ? html`<span style="font-size:0.85em; color:var(--secondary-text-color, #727272); font-style:italic;">Список пуст (рассылка отключена)</span>` : html``}
              </div>
              <div class="input-row" style="margin-top:6px;">
                <input type="text" id="newRecipientInput" placeholder="+79001234567">
                <button @click="${this._handleAddRecipient}" ?disabled="${isOffline}">+ Добавить</button>
              </div>
            </div>
          ` : html``}

          <!-- Voice Call Panel -->
          ${isCallVisible ? html`
            <div class="tool-panel">
              <div class="section-title">📞 Звонок-Сброс (Call-Drop)</div>
              <div class="input-row">
                <input type="text" id="callNumber" placeholder="+79001234567">
                <button class="btn-success" @click="${this._handleCall}" ?disabled="${isOffline}">Вызов</button>
                <button class="btn-danger" @click="${this._handleHangup}" ?disabled="${isOffline}">Сброс</button>
              </div>
            </div>
          ` : html``}

          <!-- Tariff Editor Panel -->
          ${isTariffEditorVisible ? html`
            <div class="tool-panel">
              <div class="section-title">⚙️ Управление тарифом и расходом</div>
              <div style="font-size:0.8em; color:var(--secondary-text-color, #727272); margin-bottom:6px;">
                Задайте лимиты пакета и текущий расход. 0 — безлимит.
              </div>
              <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
                <div>
                  <label style="font-size:0.75em; color:var(--secondary-text-color, #727272);">Лимит SMS в месяц</label>
                  <input type="number" id="tariffSmsLimit" placeholder="30" value="${tariffSmsState?.attributes?.sms_limit ?? 30}">
                </div>
                <div>
                  <label style="font-size:0.75em; color:var(--secondary-text-color, #727272);">Использовано SMS</label>
                  <input type="number" id="tariffSmsUsed" placeholder="0" value="${tariffSmsState?.attributes?.sms_month_count ?? 0}">
                </div>
              </div>
              <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px; margin-top:6px;">
                <div>
                  <label style="font-size:0.75em; color:var(--secondary-text-color, #727272);">Лимит минут в месяц</label>
                  <input type="number" id="tariffCallLimit" placeholder="0" value="${tariffCallState?.attributes?.call_minutes_limit ?? 0}">
                </div>
                <div>
                  <label style="font-size:0.75em; color:var(--secondary-text-color, #727272);">Использовано минут</label>
                  <input type="number" step="0.1" id="tariffCallUsed" placeholder="0" value="${tariffCallState?.attributes?.call_minutes_used ?? 0}">
                </div>
              </div>
              <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px; margin-top:6px;">
                <div>
                  <label style="font-size:0.75em; color:var(--secondary-text-color, #727272);">Лимит трафика (MB)</label>
                  <input type="number" id="tariffDataLimit" placeholder="0" value="${tariffSmsState?.attributes?.data_traffic_limit_mb ?? 0}">
                </div>
                <div>
                  <label style="font-size:0.75em; color:var(--secondary-text-color, #727272);">Использовано трафика (MB)</label>
                  <input type="number" step="0.1" id="tariffDataUsed" placeholder="0" value="${((tariffSmsState?.attributes?.data_bytes_used ?? 0) / 1048576).toFixed(1)}">
                </div>
              </div>
              <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px; margin-top:6px;">
                <div>
                  <label style="font-size:0.75em; color:var(--secondary-text-color, #727272);">День сброса квоты (1-31)</label>
                  <input type="number" id="tariffResetDay" min="1" max="31" placeholder="1" value="${tariffSmsState?.attributes?.reset_day_of_month ?? 1}">
                </div>
                <div>
                  <label style="font-size:0.75em; color:var(--secondary-text-color, #727272);">USSD проверки баланса</label>
                  <input type="text" id="tariffBalanceUssd" placeholder="*100#" value="${tariffSmsState?.attributes?.balance_ussd ?? '*100#'}">
                </div>
              </div>
              ${this._tariffSavedNotice ? html`
                <div style="font-size:0.85em; color:var(--success-color, #2e7d32); margin-top:6px; font-weight:600;">
                  ✓ ${this._tariffSavedNotice}
                </div>
              ` : html``}
              <div class="input-row" style="margin-top:8px; justify-content:space-between;">
                <button class="btn-danger" @click="${this._handleResetTariff}" ?disabled="${isOffline}">Сбросить квоты</button>
                <button @click="${this._handleSaveTariff}" ?disabled="${isOffline}">Сохранить тариф</button>
              </div>
            </div>
          ` : html``}

          <!-- Quick Action Toolbar -->
          ${showTools ? html`
            <div class="tools-bar">
              <button class="tool-toggle-btn ${this._activePanel === 'sms' ? 'active' : ''}" @click="${() => this._togglePanel('sms')}">
                ✉️ SMS
              </button>
              <button class="tool-toggle-btn ${this._activePanel === 'ussd' ? 'active' : ''}" @click="${() => this._togglePanel('ussd')}">
                ⚡ USSD
              </button>
              <button class="tool-toggle-btn ${this._activePanel === 'call' ? 'active' : ''}" @click="${() => this._togglePanel('call')}">
                📞 Звонок
              </button>
              <button class="tool-toggle-btn ${this._activePanel === 'recipients' ? 'active' : ''}" @click="${() => this._togglePanel('recipients')}">
                👥 Номера
              </button>
              <button class="tool-toggle-btn ${this._activePanel === 'tariff' ? 'active' : ''}" @click="${() => this._togglePanel('tariff')}">
                ⚙️ Тариф
              </button>
            </div>
          ` : html``}

          <div style="font-size:0.7em; color:var(--secondary-text-color, #727272); text-align:right; margin-top:10px;">
            GSM2MQTT Dashboard v1.3.0
          </div>

        </div>
      </ha-card>
    `;
  }

  getCardSize() {
    let size = 3;
    if (this.config?.show_tariff !== false) size += 1;
    if (this.config?.show_last_sms !== false) size += 2;
    if (this.config?.show_sms || this._activePanel === 'sms') size += 3;
    if (this.config?.show_ussd || this._activePanel === 'ussd') size += 2;
    if (this.config?.show_call || this._activePanel === 'call') size += 2;
    if (this.config?.show_recipients || this._activePanel === 'recipients') size += 2;
    if (this.config?.show_tariff_editor || this._activePanel === 'tariff') size += 3;
    return size;
  }
}

// Register custom element
customElements.define('gsm2mqtt-card', GSM2MQTTCard);

// Configure card in Lovelace picker
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'gsm2mqtt-card',
  name: 'GSM2MQTT Dashboard',
  preview: true,
  description: 'Custom Lovelace card for GSM2MQTT Gateway.',
});
