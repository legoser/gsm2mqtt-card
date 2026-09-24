# GSM2MQTT Dashboard (HA Custom Card)

Lovelace Custom Card for managing the [GSM2MQTT](https://github.com/legoser/gsm2mqtt) gateway within Home Assistant.

This frontend plugin provides a rich dashboard to visualize your GSM modem's status (Signal, Balance, Operator), read the last incoming SMS, send SMS messages, and perform USSD or Call-Drop operations directly from the Home Assistant UI.

## 📦 Installation

### HACS (Recommended)

1. Open Home Assistant and navigate to **HACS**.
2. Go to **Frontend** -> **Custom repositories** (three dots in the top right corner).
3. Add the URL of this repository and select **Lovelace** as the category.
4. Click **Install** on the newly added "GSM2MQTT Dashboard" plugin.
5. Reload your browser cache.

### Manual Installation (For testing & development)

To test the card on your live Home Assistant instance without caching issues, follow these steps:

1. Clone the repository and build the code:
   ```bash
   npm install
   npm run build
   ```
2. Copy the generated file `dist/gsm2mqtt-card.js` to your Home Assistant `config/www/` folder. For example, place it at `config/www/gsm2mqtt/gsm2mqtt-card.js`.
3. In Home Assistant, navigate to **Settings -> Dashboards -> Resources** (or Lovelace Dashboards -> Resources).
4. Add a new resource:
   - **URL:** `/local/gsm2mqtt/gsm2mqtt-card.js?v=1`
   - **Resource Type:** JavaScript Module
5. **Important:** Browsers heavily cache JavaScript modules. When you update the card's code, copy the new file and **increment the version number** in the Resource URL (e.g., `?v=2`, `?v=3`). Then hard-refresh the page (Ctrl+F5).

## ⚙️ Card Configuration

### Single Modem (Zero Configuration):

If you have a single modem connected to the gateway, simply add the card with zero configuration:

```yaml
type: custom:gsm2mqtt-card
```

The card will automatically connect to the primary GSM modem (`sensor.gsm_modem_*`) and detect all sensors, status, and communication channels.

### Multi-Modem or Custom Configuration:

If you have multiple modems or wish to customize the visible panels:

```yaml
type: custom:gsm2mqtt-card
modem_id: siemens_mc35i       # (Optional) Slot number ('1', '2') or explicit modem ID
title: GSM Gateway           # (Optional) Card title
show_tariff: true             # (Optional) Show remaining SMS tariff quota progress bar (default: true)
show_last_sms: true           # (Optional) Show last incoming SMS (default: true)
show_tools: true              # (Optional) Show interactive quick-action buttons bar (default: true)
show_sms: false               # (Optional) Permanently expand SMS sender panel (default: false)
show_ussd: false              # (Optional) Permanently expand USSD panel (default: false)
show_call: false              # (Optional) Permanently expand Call-Drop panel (default: false)
show_recipients: false        # (Optional) Permanently expand Alert Recipients panel (default: false)
show_tariff_editor: false     # (Optional) Permanently expand Tariff Editor panel (default: false)
```

### 🧩 Compact & Modular Design
By default, the card displays a clean, compact overview:
1. **Status & Balance** (ready/offline indicator, balance value)
2. **Signal & Operator** (cellular signal strength in dBm, network operator)
3. **Tariff Remaining Quota** (SMS balance vs limit with visual progress bar, monthly usage, reset day)
4. **Last Incoming Message** (sender, timestamp, text)

To access actions (SMS, USSD, Call, Recipients, Tariff configuration), click any button on the bottom toolbar (`✉️ SMS`, `⚡ USSD`, `📞 Звонок`, `👥 Номера`, `⚙️ Тариф`) to expand that panel on demand, or pin it open via `show_*` options in your card YAML.

## 📊 Cellular Tariff & Quota Tracking

GSM2MQTT tracks cellular usage per billing cycle and exposes the following Home Assistant entities:
- `sensor.gsm_modem_sms_remaining`: Primary state is remaining SMS count in current cycle. Attributes include `sms_limit`, `sms_month_count`, `sms_day_count`, `reset_day_of_month`.
- `sensor.gsm_modem_call_minutes_remaining`: Primary state is remaining call minutes.
- `button.gsm_modem_tariff_reset`: Button entity to manually reset monthly quota counters.

You can configure limits directly through the card's **⚙️ Тариф** panel or via MQTT topic `<prefix>/modem/<id>/tariff/set` (JSON: `{"sms_limit": 30, "reset_day_of_month": 1}`).

## 🔔 Home Assistant Automations & Notifications

GSM2MQTT automatically exposes a standard Home Assistant `notify` entity via MQTT Auto-Discovery:
- **Entity ID:** `notify.gsm_modem` (or `notify.gsm_modem_1_notify`)

### Using in Automations UI
In the Home Assistant Automation visual editor, select **Action** -> **Notifications** -> **Send notification via notify.gsm_modem**:
- **Message:** The text of your SMS notification.
- **Target (Optional):** Destination phone number (`+79001234567`). If omitted or left empty, the gateway automatically broadcasts the SMS to all alert recipients configured in the card / gateway!

### Call-Drop Fallback
If configured in the gateway (`security.fallback_call: true`), an automatic voice call (call-drop) will be dialed to the recipient if the SMS fails to deliver via the cellular network.

## 👥 Alert Recipients Management

You can manage authorized notification recipient phone numbers directly from the dashboard card without restarting the gateway or editing configuration files.
- The numbers are persisted on the gateway in `data/recipients.json`.
- Broadcast SMS: sending an SMS with an empty recipient will send it to all active recipients.
- Editable via the card or via the discovered Home Assistant Text entity `text.gsm2mqtt_gateway_recipients`.

## 🤖 AI Integration (Home Assistant Assist)

To allow Home Assistant's built-in AI (Assist) to send SMS using your gateway, you can register a script that the AI can call.

Add the following to your `scripts.yaml` in Home Assistant:

```yaml
notify_gsm2mqtt_sms:
  alias: "Отправить SMS через GSM2MQTT"
  icon: "mdi:message-processing"
  fields:
    target:
      description: "Номер получателя в формате +79XXXXXXXXX (необязательно)"
      example: "+79001234567"
      required: false
    message:
      description: "Текст SMS сообщения"
      example: "Внимание!"
      required: true
  sequence:
    - action: notify.send_message
      target:
        entity_id: notify.gsm_modem
      data:
        message: "{{ message }}"
        target: "{{ target }}"
```

**Exposing to Assist:**
1. Navigate to **Settings -> Voice Assistants -> Expose**.
2. Find the script `Отправить SMS через GSM2MQTT` and enable it for Assist.
3. Now you can say or type to Assist: *"Отправь SMS на номер +79991234567 с текстом Привет!"*, and Assist will execute the notification!

## 🛠 Development

The card is built using modern Home Assistant standards ([Lit](https://lit.dev/)).

```bash
npm install
npm run build
# Or to automatically rebuild on changes:
npm run watch
```
