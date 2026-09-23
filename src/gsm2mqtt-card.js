import { LitElement, html, css } from 'lit';

console.info('%c GSM2MQTT-DASHBOARD %c v1.1.0 ', 'color: white; background: #03a9f4; font-weight: 700; border-radius: 3px 0 0 3px;', 'color: #03a9f4; background: #e1f5fe; font-weight: 700; border-radius: 0 3px 3px 0;');

class GSM2MQTTCard extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
      _ussdWaiting: { state: true },
      _ussdResponse: { state: true },
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
        margin: 12px 0 4px;
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
    const to = this.shadowRoot.getElementById('smsTo').value;
    const text = this.shadowRoot.getElementById('smsText').value;
    if (to && text) {
      this._publishMqtt('sms/send', JSON.stringify({ to, text, request_report: true }));
      this.shadowRoot.getElementById('smsText').value = '';
    }
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

    // Last incoming SMS display (robust text reading)
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

    return html`
      <ha-card header="${this.config.title}">
        <div class="card-content">

          ${isOffline ? html`
            <div class="offline-banner">
              <span>⚠️</span>
              <span>Шлюз GSM2MQTT или модем не подключен (Offline)</span>
            </div>
          ` : html``}

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

          <!-- USSD -->
          <div class="section-title">⚡ USSD Запрос</div>
          <div class="input-row">
            <input type="text" id="ussdInput" value="*100#">
            <button @click="${this._handleUssd}" ?disabled="${isOffline}">Запрос</button>
          </div>
          <div style="display:flex; gap:6px; margin-top:4px;">
            <span class="quick-btn" @click="${() => this._setUssd('*100#')}">*100# Баланс</span>
            <span class="quick-btn" @click="${() => this._setUssd('*105#')}">*105# Тариф</span>
          </div>
          ${ussdResponseHtml}

          <!-- Send SMS -->
          <div class="section-title">✉️ Отправить SMS</div>
          <input type="text" id="smsTo" class="mb-1" placeholder="+79001234567">
          <textarea id="smsText" rows="2" placeholder="Текст сообщения..."></textarea>
          <div class="input-row" style="justify-content:flex-end;">
            <button @click="${this._handleSms}" ?disabled="${isOffline}">Отправить</button>
          </div>

          <!-- Voice Call (Call-Drop) -->
          <div class="section-title">📞 Звонок-Сброс (Call-Drop)</div>
          <div class="input-row">
            <input type="text" id="callNumber" placeholder="+79001234567">
            <button class="btn-success" @click="${this._handleCall}" ?disabled="${isOffline}">Вызов</button>
            <button class="btn-danger" @click="${this._handleHangup}" ?disabled="${isOffline}">Сброс</button>
          </div>

          <!-- Inbox -->
          <div class="section-title">📥 Последнее сообщение</div>
          <div class="inbox-box">
            ${lastSmsHtml}
          </div>

          <div style="font-size:0.7em; color:var(--secondary-text-color, #727272); text-align:right; margin-top:10px;">
            GSM2MQTT Dashboard v1.1.0
          </div>

        </div>
      </ha-card>
    `;
  }

  getCardSize() {
    return 6;
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
