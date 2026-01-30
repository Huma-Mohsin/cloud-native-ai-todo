"""Agent service for AI integration (Gemini/OpenAI).

Phase III: AI-Powered Chatbot - Agent Service
"""

import re
import os
from typing import Any
from sqlalchemy.ext.asyncio import AsyncSession

try:
    import google.genai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

from ..mcp.server import get_mcp_server


class AgentService:
    """Service for managing AI agent interactions.

    This service wraps AI providers (Gemini/OpenAI) and provides methods for
    running the agent with MCP tools. Falls back to rule-based parsing
    when no AI API key is available.
    """

    def __init__(self):
        """Initialize the agent service."""
        self.mcp_server = get_mcp_server()
        self.ai_provider = os.getenv("AI_PROVIDER", "gemini").lower()
        self.gemini_api_key = os.getenv("GEMINI_API_KEY")
        self.openai_api_key = os.getenv("OPENAI_API_KEY")

        # Initialize Gemini if available
        if self.ai_provider == "gemini" and self.gemini_api_key and GEMINI_AVAILABLE:
            genai.configure(api_key=self.gemini_api_key)
            self.gemini_model = genai.GenerativeModel(
                os.getenv("GEMINI_MODEL", "gemini-2.0-flash-exp")
            )
            self.use_ai = True
        elif self.ai_provider == "openai" and self.openai_api_key:
            self.use_ai = True
        else:
            self.use_ai = False

    async def run_agent(
        self,
        user_id: str,
        message: str,
        conversation_history: list[dict[str, str]],
        language: str,
        session: AsyncSession,
    ) -> dict[str, Any]:
        """Run the AI agent with the user's message.

        Args:
            user_id: User identifier from Better Auth
            message: User's message
            conversation_history: Previous messages in the conversation
            language: Language preference (en or ur)
            session: Database session for MCP tool calls

        Returns:
            Dictionary with agent response and tool calls
        """
        if self.use_ai:
            if self.ai_provider == "gemini":
                return await self._run_gemini_agent(user_id, message, conversation_history, language, session)
            else:
                return await self._run_openai_agent(user_id, message, conversation_history, language, session)
        else:
            return await self._run_rule_based_agent(user_id, message, session)

    async def _run_gemini_agent(
        self,
        user_id: str,
        message: str,
        conversation_history: list[dict[str, str]],
        language: str,
        session: AsyncSession,
    ) -> dict[str, Any]:
        """Run Gemini AI agent with conversation history."""
        try:
            # Build conversation history for Gemini
            chat_history = []
            for msg in conversation_history:
                role = "user" if msg["role"] == "user" else "model"
                chat_history.append({
                    "role": role,
                    "parts": [msg["content"]]
                })

            # Create chat session with history
            chat = self.gemini_model.start_chat(history=chat_history)

            # Get system prompt based on language
            system_prompt = self._get_system_prompt(language)

            # Send user message
            full_message = f"{system_prompt}\n\nUser: {message}"
            response = chat.send_message(full_message)

            return {
                "response": response.text,
                "tool_calls": [],
                "messages": conversation_history + [{"role": "user", "content": message}],
            }

        except Exception as e:
            return {
                "response": f"Sorry, I encountered an error with Gemini AI: {str(e)}",
                "tool_calls": [],
            }

    def _get_system_prompt(self, language: str) -> str:
        """Get system prompt based on language preference."""
        if language == "ur":
            return """آپ ایک مددگار، گفتگو کرنے والا AI اسسٹنٹ ہیں جو ٹاسک مینجمنٹ ایپلیکیشن کے لیے ہے۔

جب صارفین ٹاسک بناتے ہیں، تو ہمیشہ انہیں ان تفصیلات کے ساتھ حسب ضرورت بنانے میں مدد کریں:
- ترجیح (زیادہ، درمیانی، کم)
- آخری تاریخ (کب مکمل کرنا ہے)
- کیٹگری (ٹاسک منظم کرنے کے لیے)
- تفصیل (اضافی تفصیلات)
- ٹیگز (جلدی فلٹر کرنے کے لیے)

گفتگو کا بہاو:
1. جب صارف ٹاسک شامل کرے، فوری طور پر بنائیں
2. پھر ہمیشہ حسب ضرورت بنانے کی پیشکش کریں: "✅ ٹاسک '[عنوان]' بن گیا (ID: X)! کیا آپ اسے حسب ضرورت بنانا چاہیں گے? میں ترجیح، آخری تاریخ، کیٹگری، تفصیل، یا ٹیگز سیٹ کرنے میں مدد کر سکتا ہوں۔ بس مجھے بتائیں!"
3. جب صارف تفصیلات فراہم کرے، ٹاسک اپ ڈیٹ کریں اور تصدیق کریں
4. پوری گفتگو میں دوستانہ رہیں

مثالیں:
صارف: "گروسری خریدنے کا ٹاسک شامل کریں"
آپ: "✅ ٹاسک 'گروسری خریدیں' بن گیا (ID: 42)! کیا آپ اسے حسب ضرورت بنانا چاہیں گے؟ میں ترجیح، آخری تاریخ، کیٹگری، تفصیل، یا ٹیگز سیٹ کرنے میں مدد کر سکتا ہوں۔"

صارف: "ترجیح زیادہ اور آخری تاریخ کل سیٹ کریں"
آپ: "✅ اپ ڈیٹ ہو گیا! ترجیح زیادہ اور آخری تاریخ کل کے لیے سیٹ کر دی گئی۔ اور کچھ شامل کرنا چاہیں گے؟"

قدرتی، مددگار رہیں اور صارفین کو ان کے ٹاسک منظم کرنے میں فعال طور پر مدد کریں!"""
        else:
            # Default English system prompt
            return """You are a helpful, conversational AI assistant for a task management application.

When users create tasks, ALWAYS help them customize it with these details:
- Priority (high, medium, low)
- Due date (when it needs to be done)
- Category (to organize tasks)
- Description (additional details)
- Tags (for quick filtering)

CONVERSATION FLOW:
1. When a user adds a task, create it immediately
2. Then ALWAYS offer to customize it: "✅ Task '[title]' created (ID: X)! Would you like to customize it? I can help set priority, due date, category, description, or tags. Just tell me what you'd like!"
3. When user provides details, update the task and confirm
4. Be friendly and conversational throughout

EXAMPLES:
User: "Add task buy groceries"
You: "✅ Task 'Buy groceries' created (ID: 42)! Would you like to customize it? I can help set priority, due date, category, description, or tags. Just tell me what you'd like!"

User: "Set priority to high and due date tomorrow"
You: "✅ Updated! Priority set to high and due date set for tomorrow. Anything else you'd like to add?"

Be natural, helpful, and proactive in helping users organize their tasks!"""

    async def _run_openai_agent(
        self,
        user_id: str,
        message: str,
        conversation_history: list[dict[str, str]],
        language: str,
        session: AsyncSession,
    ) -> dict[str, Any]:
        """Run OpenAI Agents SDK (when API key is available)."""
        # TODO: Implement OpenAI Agents SDK integration with language support
        messages = conversation_history + [{"role": "user", "content": message}]
        return {
            "response": "OpenAI integration coming soon!",
            "tool_calls": [],
            "messages": messages,
        }

    async def _run_rule_based_agent(
        self,
        user_id: str,
        message: str,
        session: AsyncSession,
    ) -> dict[str, Any]:
        """Rule-based fallback agent for parsing natural language commands."""
        message_lower = message.lower().strip()
        tool_calls = []

        try:
            # Pattern 1: Add task
            if any(keyword in message_lower for keyword in ["add", "create", "new task", "remember to", "need to"]):
                result = await self._handle_add_task(user_id, message, session)
                tool_calls.append({"tool": "add_task", "result": "success"})
                print(f"DEBUG: _handle_add_task returned: {result}")  # DEBUG LOG
                response_dict = {
                    "response": result["response"],
                    "tool_calls": tool_calls
                }
                # Add quick_actions if present
                if "quick_actions" in result:
                    response_dict["quick_actions"] = result["quick_actions"]
                    print(f"DEBUG: quick_actions added to response!")  # DEBUG LOG
                else:
                    print(f"DEBUG: No quick_actions in result!")  # DEBUG LOG
                return response_dict

            # Pattern 2: List tasks
            elif any(keyword in message_lower for keyword in ["show", "list", "what", "my tasks", "pending", "completed"]):
                result = await self._handle_list_tasks(user_id, message_lower, session)
                tool_calls.append({"tool": "list_tasks", "result": "success"})
                return {"response": result["response"], "tool_calls": tool_calls}

            # Pattern 3: Complete task
            elif any(keyword in message_lower for keyword in ["complete", "done", "finish", "mark as complete"]):
                result = await self._handle_complete_task(user_id, message, session)
                tool_calls.append({"tool": "complete_task", "result": "success"})
                return {"response": result["response"], "tool_calls": tool_calls}

            # Pattern 4: Delete task
            elif any(keyword in message_lower for keyword in ["delete", "remove", "cancel"]):
                result = await self._handle_delete_task(user_id, message, session)
                tool_calls.append({"tool": "delete_task", "result": "success"})
                return {"response": result["response"], "tool_calls": tool_calls}

            # Pattern 5: Update task
            elif any(keyword in message_lower for keyword in ["update", "change", "modify", "edit"]):
                result = await self._handle_update_task(user_id, message, session)
                tool_calls.append({"tool": "update_task", "result": "success"})
                return {"response": result["response"], "tool_calls": tool_calls}

            # Pattern 6: Set reminder
            elif any(keyword in message_lower for keyword in ["remind", "reminder", "alarm", "alert", "notify"]):
                if "snooze" in message_lower:
                    result = await self._handle_snooze_reminder(user_id, message, session)
                    tool_calls.append({"tool": "snooze_reminder", "result": "success"})
                elif "cancel" in message_lower or "remove" in message_lower or "delete" in message_lower:
                    result = await self._handle_cancel_reminder(user_id, message, session)
                    tool_calls.append({"tool": "cancel_reminder", "result": "success"})
                elif "show" in message_lower or "list" in message_lower:
                    result = await self._handle_list_reminders(user_id, message, session)
                    tool_calls.append({"tool": "list_reminders", "result": "success"})
                elif "dismiss" in message_lower:
                    result = await self._handle_dismiss_reminder(user_id, message, session)
                    tool_calls.append({"tool": "dismiss_reminder", "result": "success"})
                else:
                    result = await self._handle_set_reminder(user_id, message, session)
                    tool_calls.append({"tool": "set_reminder", "result": "success"})
                return {"response": result["response"], "tool_calls": tool_calls}

            else:
                return {
                    "response": "I can help you manage tasks! Try:\n\n📋 Task Management:\n- 'Add a task to buy groceries'\n- 'Show me all my tasks'\n- 'Mark task 1 as complete'\n- 'Delete task 2'\n- 'Update task 3 to Call mom'\n\n⏰ Reminders:\n- 'Remind me about task 5 tomorrow at 2pm'\n- 'Set reminder for task 3 in 30 minutes'\n- 'Show my reminders'\n- 'Snooze task 5 for 10 minutes'\n- 'Cancel reminder for task 2'",
                    "tool_calls": [],
                }

        except Exception as e:
            return {
                "response": f"Sorry, I encountered an error: {str(e)}",
                "tool_calls": tool_calls,
            }

    async def _handle_add_task(self, user_id: str, message: str, session: AsyncSession) -> dict[str, Any]:
        """Parse and extract task title, but DON'T create task yet.

        Task will be created when user clicks 'Save' with all the details.
        """
        # Extract task title and description
        patterns = [
            r"add (?:a )?task (?:to )?(.+)",
            r"create (?:a )?task (?:to )?(.+)",
            r"new task[:\s]+(.+)",
            r"(?:i need to|remember to) (.+)",
        ]

        title = None
        description = None

        for pattern in patterns:
            match = re.search(pattern, message.lower())
            if match:
                content = match.group(1).strip()
                # Remove surrounding quotes if present
                content = content.strip('"').strip("'")
                # Check for description separator
                if " - " in content:
                    parts = content.split(" - ", 1)
                    title = parts[0].strip()
                    description = parts[1].strip()
                else:
                    title = content
                break

        if not title:
            title = message.strip()
            # Remove surrounding quotes if present
            title = title.strip('"').strip("'")

        # DON'T create task yet - just return quick_actions with task title
        response = f"Ready to create task: '{title}'"

        print(f"DEBUG: Task title extracted: {title}, Description: {description}")  # DEBUG

        # Return response with quick_actions for interactive UI
        return {
            "response": response,
            "quick_actions": {
                "type": "task_creation",  # Changed from task_customization
                "pending_task": {
                    "title": title,
                    "description": description,
                    "user_id": user_id
                },
                "actions": [
                    {
                        "id": "priority",
                        "label": "Priority",
                        "type": "button_group",
                        "options": [
                            {"value": "high", "label": "High"},
                            {"value": "medium", "label": "Medium"},
                            {"value": "low", "label": "Low"}
                        ]
                    },
                    {
                        "id": "due_date",
                        "label": "Due Date",
                        "type": "date_picker",
                        "quick_options": ["tomorrow", "this_week", "custom"]
                    },
                    {
                        "id": "category",
                        "label": "Category",
                        "type": "dropdown",
                        "options": ["work", "personal", "shopping", "health"]
                    },
                    {
                        "id": "description",
                        "label": "Description",
                        "type": "text_input",
                        "placeholder": description or "Add description..."
                    },
                    {
                        "id": "tags",
                        "label": "Tags",
                        "type": "tag_input",
                        "suggestions": ["urgent", "important", "groceries"]
                    }
                ]
            }
        }

    async def _handle_list_tasks(self, user_id: str, message: str, session: AsyncSession) -> dict[str, Any]:
        """Parse and execute list_tasks command."""
        # Determine filter
        completed_only = "completed" in message or "done" in message or "finished" in message
        pending_only = "pending" in message or "incomplete" in message or "todo" in message

        result = await self.mcp_server.call_tool(
            "list_tasks",
            {
                "user_id": user_id,
                "completed_only": completed_only,
                "pending_only": pending_only,
            },
            session,
        )

        if result.get("success"):
            tasks = result.get("tasks", [])
            if not tasks:
                return {"response": "You don't have any tasks yet. Try adding one!"}

            response = f"Your tasks ({len(tasks)}):\n\n"
            for task in tasks:
                status = "[X]" if task["completed"] else "[ ]"
                response += f"{status} [{task['id']}] {task['title']}"
                if task.get("description"):
                    response += f"\n   {task['description']}"
                response += "\n"

            return {"response": response.strip()}
        else:
            return {"response": f"Failed to list tasks: {result.get('error', 'Unknown error')}"}

    async def _handle_complete_task(self, user_id: str, message: str, session: AsyncSession) -> dict[str, Any]:
        """Parse and execute complete_task command."""
        # Extract task ID
        match = re.search(r"(?:task\s+)?(\d+)", message)
        if not match:
            return {"response": "Please specify a task ID (e.g., 'Mark task 1 as complete')"}

        task_id = int(match.group(1))

        result = await self.mcp_server.call_tool(
            "complete_task",
            {"user_id": user_id, "task_id": task_id},
            session,
        )

        if result.get("success"):
            return {"response": f"Task {task_id} marked as complete!"}
        else:
            return {"response": f"Failed to complete task: {result.get('error', 'Task not found')}"}

    async def _handle_delete_task(self, user_id: str, message: str, session: AsyncSession) -> dict[str, Any]:
        """Parse and execute delete_task command."""
        # Extract task ID
        match = re.search(r"(?:task\s+)?(\d+)", message)
        if not match:
            return {"response": "Please specify a task ID (e.g., 'Delete task 1')"}

        task_id = int(match.group(1))

        result = await self.mcp_server.call_tool(
            "delete_task",
            {"user_id": user_id, "task_id": task_id},
            session,
        )

        if result.get("success"):
            return {"response": f"Task {task_id} has been deleted"}
        else:
            return {"response": f"Failed to delete task: {result.get('error', 'Task not found')}"}

    async def _handle_update_task(self, user_id: str, message: str, session: AsyncSession) -> dict[str, Any]:
        """Parse and execute update_task command with support for priority, due_date, category, tags."""
        from datetime import datetime, timedelta
        import re

        message_lower = message.lower()

        # Try to extract task ID
        task_id_match = re.search(r"(?:task\s+)?(\d+)", message)
        task_id = int(task_id_match.group(1)) if task_id_match else None

        # If no explicit task ID and user just said "set priority...", get the last created task
        # For now, we'll require task ID
        if not task_id:
            # Check if this is a follow-up to task creation (contains set/add keywords but no task ID)
            if any(keyword in message_lower for keyword in ["set", "add", "priority", "due", "category", "tag"]):
                return {"response": "Which task would you like to update? Please include the task ID (e.g., 'Update task 42 with...')"}

            # Traditional update format
            match = re.search(r"(?:task\s+)?(\d+)\s+(?:to|with)\s+['\"]?(.+?)['\"]?$", message, re.IGNORECASE)
            if not match:
                return {"response": "Please specify task ID (e.g., 'Update task 1 to Call mom')"}
            task_id = int(match.group(1))

        # Extract update parameters
        title = None
        description = None
        priority = None
        due_date = None
        category = None
        tags = None

        # Parse priority
        if "priority" in message_lower:
            if "high" in message_lower:
                priority = "high"
            elif "medium" in message_lower:
                priority = "medium"
            elif "low" in message_lower:
                priority = "low"

        # Parse due date
        if any(keyword in message_lower for keyword in ["due", "deadline", "by"]):
            if "tomorrow" in message_lower:
                due_date = (datetime.now() + timedelta(days=1)).isoformat()
            elif "today" in message_lower:
                due_date = datetime.now().isoformat()
            elif "next week" in message_lower:
                due_date = (datetime.now() + timedelta(days=7)).isoformat()
            # You can add more date parsing here

        # Parse category
        category_match = re.search(r"category\s+(?:to\s+)?['\"]?([a-zA-Z0-9\s]+)['\"]?", message_lower)
        if category_match:
            category = category_match.group(1).strip()

        # Parse tags
        tags_match = re.search(r"tags?\s+(?:to\s+)?['\"]?([a-zA-Z0-9\s,]+)['\"]?", message_lower)
        if tags_match:
            tags = [tag.strip() for tag in tags_match.group(1).split(",")]

        # Parse description
        desc_match = re.search(r"description\s+(?:to\s+)?['\"]?(.+?)['\"]?(?:\s+and|\s+with|\s*$)", message, re.IGNORECASE)
        if desc_match:
            description = desc_match.group(1).strip()

        # Parse title (if updating title directly)
        title_match = re.search(r"(?:title|name)\s+(?:to\s+)?['\"]?([^,\n]+?)['\"]?(?:\s+and|\s+with|\s*$)", message, re.IGNORECASE)
        if title_match:
            title = title_match.group(1).strip()

        # If no specific fields found, treat as title update
        if not any([title, description, priority, due_date, category, tags]):
            match = re.search(r"(?:task\s+)?\d+\s+(?:to|with)\s+['\"]?(.+?)['\"]?$", message, re.IGNORECASE)
            if match:
                new_content = match.group(1).strip()
                if " - " in new_content:
                    parts = new_content.split(" - ", 1)
                    title = parts[0].strip()
                    description = parts[1].strip()
                else:
                    title = new_content

        result = await self.mcp_server.call_tool(
            "update_task",
            {
                "user_id": user_id,
                "task_id": task_id,
                "title": title,
                "description": description,
                "priority": priority,
                "due_date": due_date,
                "category": category,
                "tags": tags,
            },
            session,
        )

        if result.get("success"):
            updates = []
            if priority:
                updates.append(f"priority to {priority}")
            if due_date:
                updates.append(f"due date")
            if category:
                updates.append(f"category to '{category}'")
            if tags:
                updates.append(f"tags")
            if title:
                updates.append(f"title")
            if description:
                updates.append(f"description")

            update_text = ", ".join(updates) if updates else "task"
            response = f"Updated {update_text} for task {task_id}! Anything else you'd like to change?"
            return {"response": response}
        else:
            return {"response": f"Failed to update task: {result.get('error', 'Task not found')}"}

    async def _handle_set_reminder(self, user_id: str, message: str, session: AsyncSession) -> dict[str, Any]:
        """Parse and set a reminder for a task."""
        from datetime import datetime, timedelta
        from ..services.reminder_service import ReminderService

        message_lower = message.lower()

        # Extract task ID
        task_id_match = re.search(r"(?:task\s+)?(\d+)", message)
        if not task_id_match:
            return {"response": "Please specify a task ID (e.g., 'Remind me about task 5 tomorrow at 2pm')"}

        task_id = int(task_id_match.group(1))

        # Parse time expressions
        reminder_time = None

        # Pattern: "tomorrow at 2pm"
        if "tomorrow" in message_lower:
            tomorrow = datetime.utcnow() + timedelta(days=1)
            time_match = re.search(r"at\s+(\d+)(?::(\d+))?\s*(am|pm)?", message_lower)
            if time_match:
                hour = int(time_match.group(1))
                minute = int(time_match.group(2)) if time_match.group(2) else 0
                period = time_match.group(3)
                if period == "pm" and hour < 12:
                    hour += 12
                elif period == "am" and hour == 12:
                    hour = 0
                reminder_time = tomorrow.replace(hour=hour, minute=minute, second=0, microsecond=0)
            else:
                reminder_time = tomorrow.replace(hour=9, minute=0, second=0, microsecond=0)

        # Pattern: "in X minutes/hours" or "after X minutes"
        elif "in" in message_lower or "after" in message_lower:
            in_match = re.search(r"(?:in|after)\s+(\d+)\s+(minute|hour|day)s?", message_lower)
            if in_match:
                amount = int(in_match.group(1))
                unit = in_match.group(2)
                if unit == "minute":
                    reminder_time = datetime.utcnow() + timedelta(minutes=amount)
                elif unit == "hour":
                    reminder_time = datetime.utcnow() + timedelta(hours=amount)
                elif unit == "day":
                    reminder_time = datetime.utcnow() + timedelta(days=amount)

        # Pattern: "today at 2pm"
        elif "today" in message_lower:
            today = datetime.utcnow()
            time_match = re.search(r"at\s+(\d+)(?::(\d+))?\s*(am|pm)?", message_lower)
            if time_match:
                hour = int(time_match.group(1))
                minute = int(time_match.group(2)) if time_match.group(2) else 0
                period = time_match.group(3)
                if period == "pm" and hour < 12:
                    hour += 12
                elif period == "am" and hour == 12:
                    hour = 0
                reminder_time = today.replace(hour=hour, minute=minute, second=0, microsecond=0)

        if not reminder_time:
            return {"response": "I couldn't understand the time. Try:\n- 'Remind me about task 5 in 30 minutes'\n- 'Remind me about task 5 after 1 hour'\n- 'Remind me about task 3 tomorrow at 2pm'\n- 'Remind me about task 8 today at 5pm'"}

        # Set the reminder
        task = await ReminderService.set_reminder(task_id, user_id, reminder_time, session)

        if not task:
            return {"response": f"Failed to set reminder: Task {task_id} not found"}

        # Convert UTC reminder time to local time for display
        from zoneinfo import ZoneInfo
        from datetime import timezone

        # Get local timezone (system timezone)
        local_tz = datetime.now().astimezone().tzinfo

        # Convert reminder_time from UTC to local time
        reminder_time_utc = reminder_time.replace(tzinfo=timezone.utc)
        reminder_time_local = reminder_time_utc.astimezone(local_tz)

        # Format time in 12-hour format with local timezone
        time_str = reminder_time_local.strftime("%I:%M %p")
        date_str = reminder_time_local.strftime("%B %d, %Y")
        day_of_week = reminder_time_local.strftime("%A")

        # Check if it's today or tomorrow
        now_local = datetime.now().astimezone(local_tz)
        days_diff = (reminder_time_local.date() - now_local.date()).days

        if days_diff == 0:
            when_str = f"today at {time_str}"
        elif days_diff == 1:
            when_str = f"tomorrow at {time_str}"
        else:
            when_str = f"on {day_of_week}, {date_str} at {time_str}"

        response = f"⏰ Reminder set!\n📋 Task #{task_id}: {task.title}\n🔔 You'll be reminded {when_str}"

        return {"response": response}

    async def _handle_snooze_reminder(self, user_id: str, message: str, session: AsyncSession) -> dict[str, Any]:
        """Parse and snooze a reminder."""
        from ..services.reminder_service import ReminderService

        message_lower = message.lower()

        # Extract task ID
        task_id_match = re.search(r"(?:task\s+)?(\d+)", message)
        if not task_id_match:
            return {"response": "Please specify a task ID (e.g., 'Snooze task 5 for 10 minutes')"}

        task_id = int(task_id_match.group(1))

        # Extract snooze duration
        snooze_minutes = 10  # Default: 10 minutes

        duration_match = re.search(r"(\d+)\s+(minute|hour)s?", message_lower)
        if duration_match:
            amount = int(duration_match.group(1))
            unit = duration_match.group(2)
            if unit == "minute":
                snooze_minutes = amount
            elif unit == "hour":
                snooze_minutes = amount * 60

        # Snooze the reminder
        task = await ReminderService.snooze_reminder(task_id, user_id, snooze_minutes, session)

        if not task:
            return {"response": f"Failed to snooze reminder: Task {task_id} not found"}

        # Format exact time with UTC
        next_time = task.snooze_until.strftime('%I:%M %p UTC')
        response = f"⏰ Reminder snoozed!\n📋 Task #{task_id}: {task.title}\n⏸️ Snoozed for {snooze_minutes} minutes\n🔔 Next reminder: {next_time}"

        return {"response": response}

    async def _handle_dismiss_reminder(self, user_id: str, message: str, session: AsyncSession) -> dict[str, Any]:
        """Dismiss a reminder."""
        from ..services.reminder_service import ReminderService

        # Extract task ID
        task_id_match = re.search(r"(?:task\s+)?(\d+)", message)
        if not task_id_match:
            return {"response": "Please specify a task ID (e.g., 'Dismiss reminder for task 5')"}

        task_id = int(task_id_match.group(1))

        # Dismiss the reminder
        task = await ReminderService.dismiss_reminder(task_id, user_id, session)

        if not task:
            return {"response": f"Failed to dismiss reminder: Task {task_id} not found"}

        response = f"✅ Reminder dismissed for Task #{task_id}: {task.title}"

        return {"response": response}

    async def _handle_cancel_reminder(self, user_id: str, message: str, session: AsyncSession) -> dict[str, Any]:
        """Cancel a reminder completely."""
        from ..services.reminder_service import ReminderService

        # Extract task ID
        task_id_match = re.search(r"(?:task\s+)?(\d+)", message)
        if not task_id_match:
            return {"response": "Please specify a task ID (e.g., 'Cancel reminder for task 5')"}

        task_id = int(task_id_match.group(1))

        # Cancel the reminder
        task = await ReminderService.cancel_reminder(task_id, user_id, session)

        if not task:
            return {"response": f"Failed to cancel reminder: Task {task_id} not found"}

        response = f"🔕 Reminder cancelled for Task #{task_id}: {task.title}"

        return {"response": response}

    async def _handle_list_reminders(self, user_id: str, message: str, session: AsyncSession) -> dict[str, Any]:
        """List all active reminders for user."""
        from ..services.reminder_service import ReminderService

        # Get all active reminders
        reminders = await ReminderService.get_user_reminders(user_id, session)

        if not reminders:
            return {"response": "You don't have any active reminders set."}

        response = f"⏰ Your active reminders ({len(reminders)}):\n\n"
        for task in reminders:
            if task.snooze_until:
                time_str = task.snooze_until.strftime("%B %d at %I:%M %p")
                status = "Snoozed"
            elif task.reminder_time:
                time_str = task.reminder_time.strftime("%B %d at %I:%M %p")
                status = "Active"
            else:
                continue

            response += f"📋 Task #{task.id}: {task.title}\n"
            response += f"   🔔 {status} - {time_str}\n\n"

        return {"response": response.strip()}

    async def execute_tool_call(
        self,
        tool_name: str,
        arguments: dict[str, Any],
        session: AsyncSession,
    ) -> dict[str, Any]:
        """Execute a tool call via MCP server.

        Args:
            tool_name: Name of the tool to call
            arguments: Tool arguments
            session: Database session

        Returns:
            Tool execution result
        """
        return await self.mcp_server.call_tool(tool_name, arguments, session)


# Global agent service instance
_agent_service = None


def get_agent_service() -> AgentService:
    """Get the global agent service instance.

    Returns:
        AgentService instance
    """
    global _agent_service
    if _agent_service is None:
        _agent_service = AgentService()
    return _agent_service
