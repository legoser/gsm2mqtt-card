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

If you have multiple modems or wish to target a specific modem:

```yaml
type: custom:gsm2mqtt-card
modem_id: 2                   # Or explicit modem ID (e.g. siemens_mc35i)
title: Secondary GSM Gateway  # (Optional) Card title
topic_prefix: gsm2mqtt        # (Optional) Gateway topic prefix, default: gsm2mqtt
```

- `modem_id` (Optional): The modem slot index (`1`, `2`) or unique ID (`siemens_mc35i`). Defaults to automatic auto-detection.
- `title` (Optional): Title of the card. Default is `GSM2MQTT Dashboard`.
- `topic_prefix` (Optional): The MQTT topic prefix used by the gateway. Default is `gsm2mqtt`.

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
