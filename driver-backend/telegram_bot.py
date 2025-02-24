from telegram import Update
from telegram.ext import Updater, CommandHandler, MessageHandler, Filters, CallbackContext
import requests

# Define the Flask API URL (adjust if hosted differently)
FLASK_API_URL = 'http://127.0.0.1:5000/'

# Define the bot token you received from BotFather
TELEGRAM_TOKEN = 'YOUR_TELEGRAM_BOT_API_TOKEN'

# Initialize the updater and dispatcher
updater = Updater(token=TELEGRAM_TOKEN, use_context=True)
dispatcher = updater.dispatcher

# Function to handle the /start command (when a user starts the bot)
def start(update: Update, context: CallbackContext):
    update.message.reply_text("Welcome! Send /report to submit a road issue or /status to check report status.")

# Function to handle the /report command (submit a report)
def report(update: Update, context: CallbackContext):
    update.message.reply_text("Please provide the issue type (e.g., Accident, Traffic Jam) followed by the location.")
    return

# Function to handle the /status command (check report status)
def status(update: Update, context: CallbackContext):
    update.message.reply_text("Please provide the report ID to check the status.")
    return

# Function to handle incoming messages
def handle_message(update: Update, context: CallbackContext):
    message = update.message.text.lower()

    # Check if user is submitting a report
    if message.startswith("report:"):
        issue_data = message.replace("report:", "").strip().split(" at ")
        if len(issue_data) == 2:
            issue_type = issue_data[0]
            location = issue_data[1]

            # Send report to Flask API
            response = requests.post(FLASK_API_URL + 'report', json={"issue_type": issue_type, "location": location})

            if response.status_code == 201:
                update.message.reply_text(f"Your report for {issue_type} at {location} has been submitted!")
            else:
                update.message.reply_text("Failed to submit the report. Please try again later.")
        else:
            update.message.reply_text("Invalid format. Please provide both issue type and location like: 'report: Accident at Main St.'")
    elif message.startswith("status:"):
        report_id = message.replace("status:", "").strip()

        # Check report status using Flask API
        response = requests.get(FLASK_API_URL + 'reports')
        reports = response.json()
        report_found = next((r for r in reports if str(r['id']) == report_id), None)

        if report_found:
            confirmed_status = "confirmed" if report_found['confirmed'] else "not confirmed"
            update.message.reply_text(f"Report ID: {report_found['id']}\nIssue: {report_found['issue']}\nLocation: {report_found['location']}\nStatus: {confirmed_status}")
        else:
            update.message.reply_text(f"Report ID {report_id} not found.")
    else:
        update.message.reply_text("Sorry, I didn't understand that. Use /report to submit a report or /status to check the status.")

# Register handlers
dispatcher.add_handler(CommandHandler('start', start))
dispatcher.add_handler(CommandHandler('report', report))
dispatcher.add_handler(CommandHandler('status', status))
dispatcher.add_handler(MessageHandler(Filters.text & ~Filters.command, handle_message))

# Start the bot
updater.start_polling()
