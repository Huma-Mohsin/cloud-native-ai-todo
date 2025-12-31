"""Command-line interface for the Todo application."""

from todo_app.models import Task
from todo_app.operations import TodoOperations


class TodoCLI:
    """Interactive CLI for managing todos.

    Provides a menu-driven interface for all todo operations.

    Attributes:
        operations: TodoOperations instance for business logic.
    """

    def __init__(self, operations: TodoOperations) -> None:
        """Initialize CLI with operations.

        Args:
            operations: TodoOperations instance.
        """
        self.operations = operations

    def run(self) -> None:
        """Run the main CLI loop."""
        print("\n" + "=" * 50)
        print("Welcome to Todo App!")
        print("=" * 50)

        while True:
            try:
                self.display_menu()
                choice = self.get_menu_choice()

                if choice == 1:
                    self._handle_add_task()
                elif choice == 2:
                    self._handle_view_tasks()
                elif choice == 3:
                    self._handle_update_task()
                elif choice == 4:
                    self._handle_delete_task()
                elif choice == 5:
                    self._handle_mark_complete()
                elif choice == 6:
                    print("\nGoodbye! Your tasks have been saved.\n")
                    break

                input("\nPress Enter to continue...")

            except KeyboardInterrupt:
                print("\n\nGoodbye! Your tasks have been saved.\n")
                break

    def display_menu(self) -> None:
        """Display the main menu."""
        print("\n" + "-" * 50)
        print("MAIN MENU")
        print("-" * 50)
        print("1. Add New Task")
        print("2. View All Tasks")
        print("3. Update Task")
        print("4. Delete Task")
        print("5. Mark Task as Complete/Pending")
        print("6. Exit")
        print("-" * 50)

    def get_menu_choice(self) -> int:
        """Get and validate menu choice from user.

        Returns:
            Valid menu choice (1-6).
        """
        while True:
            try:
                choice = input("\nEnter your choice (1-6): ").strip()
                choice_num = int(choice)
                if 1 <= choice_num <= 6:
                    return choice_num
                print("Error: Please enter a number between 1 and 6.")
            except ValueError:
                print("Error: Please enter a valid number.")

    def display_tasks(self, tasks: list[Task]) -> None:
        """Display a list of tasks.

        Args:
            tasks: List of tasks to display.
        """
        if not tasks:
            print("\nNo tasks found.")
            return

        print("\n" + "=" * 80)
        print("YOUR TASKS")
        print("=" * 80)

        for task in tasks:
            status = "[✓]" if task.completed else "[ ]"
            print(f"\n{status} Task #{task.id}: {task.title}")
            if task.description:
                print(f"   Description: {task.description}")
            print(f"   Created: {task.created_at.strftime('%Y-%m-%d %H:%M')}")
            print(f"   Updated: {task.updated_at.strftime('%Y-%m-%d %H:%M')}")

        print("=" * 80)

    def prompt_task_details(self) -> tuple[str, str]:
        """Prompt user for task title and description.

        Returns:
            Tuple of (title, description).
        """
        print("\n--- Task Details ---")
        title = input("Enter task title (required): ").strip()
        description = input("Enter task description (optional): ").strip()
        return title, description

    def prompt_task_id(self, action: str) -> int:
        """Prompt user for a task ID.

        Args:
            action: Description of the action (e.g., "update", "delete").

        Returns:
            Task ID as integer.
        """
        while True:
            try:
                task_id_str = input(f"\nEnter task ID to {action}: ").strip()
                task_id = int(task_id_str)
                if task_id > 0:
                    return task_id
                print("Error: Task ID must be a positive number.")
            except ValueError:
                print("Error: Please enter a valid task ID number.")

    def _handle_add_task(self) -> None:
        """Handle adding a new task."""
        print("\n=== ADD NEW TASK ===")
        title, description = self.prompt_task_details()
        task, message = self.operations.add_task(title, description)
        print(f"\n{message}")

    def _handle_view_tasks(self) -> None:
        """Handle viewing all tasks."""
        print("\n=== VIEW ALL TASKS ===")
        tasks = self.operations.list_tasks()
        self.display_tasks(tasks)

    def _handle_update_task(self) -> None:
        """Handle updating a task."""
        print("\n=== UPDATE TASK ===")

        # First show all tasks
        tasks = self.operations.list_tasks()
        self.display_tasks(tasks)

        if not tasks:
            return

        task_id = self.prompt_task_id("update")

        print("\nEnter new values (press Enter to keep current value):")
        title_input = input("New title: ").strip()
        description_input = input("New description: ").strip()

        # Convert empty strings to None
        title: str | None = title_input if title_input else None
        description: str | None = description_input if description_input else None

        task, message = self.operations.update_task(task_id, title, description)
        print(f"\n{message}")

    def _handle_delete_task(self) -> None:
        """Handle deleting a task."""
        print("\n=== DELETE TASK ===")

        # First show all tasks
        tasks = self.operations.list_tasks()
        self.display_tasks(tasks)

        if not tasks:
            return

        task_id = self.prompt_task_id("delete")

        # Confirm deletion
        confirm = (
            input(f"\nAre you sure you want to delete task #{task_id}? (y/n): ").strip().lower()
        )
        if confirm == "y":
            _, message = self.operations.delete_task(task_id)
            print(f"\n{message}")
        else:
            print("\nDeletion cancelled.")

    def _handle_mark_complete(self) -> None:
        """Handle marking a task as complete/pending."""
        print("\n=== MARK TASK AS COMPLETE/PENDING ===")

        # First show all tasks
        tasks = self.operations.list_tasks()
        self.display_tasks(tasks)

        if not tasks:
            return

        task_id = self.prompt_task_id("toggle")
        task, message = self.operations.toggle_task_complete(task_id)
        print(f"\n{message}")
