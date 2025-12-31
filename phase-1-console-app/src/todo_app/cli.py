"""Command-line interface for the Todo application."""

from rich.console import Console
from rich.panel import Panel
from rich.prompt import Confirm, IntPrompt, Prompt
from rich.table import Table
from rich.text import Text

from todo_app.models import Task
from todo_app.operations import TodoOperations

console = Console()


class TodoCLI:
    """Interactive CLI for managing todos.

    Provides a menu-driven interface for all todo operations with rich formatting.

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
        # Welcome banner
        console.print()
        console.print(
            Panel.fit(
                "[bold cyan]Welcome to Todo App![/bold cyan]\n"
                "[dim]Manage your tasks with style[/dim]",
                border_style="bright_cyan",
                padding=(1, 2),
            )
        )

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
                    console.print()
                    console.print(
                        Panel.fit(
                            "[bold green]Goodbye! Your tasks have been saved.[/bold green]",
                            border_style="green",
                        )
                    )
                    console.print()
                    break

                console.print("\n[dim]Press Enter to continue...[/dim]", end="")
                input()

            except KeyboardInterrupt:
                console.print("\n")
                console.print(
                    Panel.fit(
                        "[bold yellow]Goodbye! Your tasks have been saved.[/bold yellow]",
                        border_style="yellow",
                    )
                )
                console.print()
                break

    def display_menu(self) -> None:
        """Display the main menu."""
        console.print()
        menu_text = Text()
        menu_text.append("1. ", style="bold cyan")
        menu_text.append("Add New Task\n", style="white")
        menu_text.append("2. ", style="bold cyan")
        menu_text.append("View All Tasks\n", style="white")
        menu_text.append("3. ", style="bold cyan")
        menu_text.append("Update Task\n", style="white")
        menu_text.append("4. ", style="bold cyan")
        menu_text.append("Delete Task\n", style="white")
        menu_text.append("5. ", style="bold cyan")
        menu_text.append("Mark Task as Complete/Pending\n", style="white")
        menu_text.append("6. ", style="bold red")
        menu_text.append("Exit", style="bold red")

        console.print(
            Panel(
                menu_text,
                title="[bold white]MAIN MENU[/bold white]",
                border_style="bright_blue",
                padding=(1, 2),
            )
        )

    def get_menu_choice(self) -> int:
        """Get and validate menu choice from user.

        Returns:
            Valid menu choice (1-6).
        """
        while True:
            try:
                choice = IntPrompt.ask(
                    "[bold cyan]Enter your choice[/bold cyan]",
                    choices=["1", "2", "3", "4", "5", "6"],
                )
                return choice
            except Exception:
                console.print("[bold red]Error:[/bold red] Please enter a number between 1 and 6.")

    def display_tasks(self, tasks: list[Task]) -> None:
        """Display a list of tasks in a beautiful table.

        Args:
            tasks: List of tasks to display.
        """
        if not tasks:
            console.print()
            console.print(
                Panel.fit(
                    "[yellow]No tasks found. Add your first task![/yellow]",
                    border_style="yellow",
                )
            )
            return

        # Create table
        table = Table(
            title="[bold cyan]YOUR TASKS[/bold cyan]",
            show_header=True,
            header_style="bold magenta",
            border_style="bright_blue",
            title_style="bold cyan",
        )

        table.add_column("ID", style="cyan", justify="center", width=6)
        table.add_column("Status", justify="center", width=8)
        table.add_column("Title", style="white", width=30)
        table.add_column("Description", style="dim white", width=35)
        table.add_column("Created", style="dim cyan", justify="center")

        for task in tasks:
            # Status with color
            if task.completed:
                status = "[bold green]✓ Done[/bold green]"
                title_style = "dim green"
            else:
                status = "[bold yellow]○ Pending[/bold yellow]"
                title_style = "bold white"

            # Truncate long text
            title = task.title[:28] + "..." if len(task.title) > 30 else task.title
            description = (
                task.description[:32] + "..."
                if len(task.description) > 35
                else task.description or "[dim]—[/dim]"
            )

            table.add_row(
                str(task.id),
                status,
                f"[{title_style}]{title}[/{title_style}]",
                description,
                task.created_at.strftime("%Y-%m-%d %H:%M"),
            )

        console.print()
        console.print(table)
        console.print()

    def prompt_task_details(self) -> tuple[str, str]:
        """Prompt user for task title and description.

        Returns:
            Tuple of (title, description).
        """
        console.print()
        title = Prompt.ask("[bold cyan]Enter task title[/bold cyan]")
        description = Prompt.ask(
            "[bold cyan]Enter task description[/bold cyan] [dim](optional)[/dim]", default=""
        )
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
                task_id = IntPrompt.ask(f"[bold cyan]Enter task ID to {action}[/bold cyan]")
                if task_id > 0:
                    return task_id
                console.print("[bold red]Error:[/bold red] Task ID must be a positive number.")
            except Exception:
                console.print("[bold red]Error:[/bold red] Please enter a valid task ID number.")

    def _handle_add_task(self) -> None:
        """Handle adding a new task."""
        console.print()
        console.print(
            Panel.fit(
                "[bold cyan]ADD NEW TASK[/bold cyan]",
                border_style="cyan",
            )
        )

        title, description = self.prompt_task_details()
        task, message = self.operations.add_task(title, description)

        if task:
            console.print()
            console.print(f"[bold green]✓[/bold green] {message}")
        else:
            console.print()
            console.print(f"[bold red]✗[/bold red] {message}")

    def _handle_view_tasks(self) -> None:
        """Handle viewing all tasks."""
        console.print()
        tasks = self.operations.list_tasks()
        self.display_tasks(tasks)

    def _handle_update_task(self) -> None:
        """Handle updating a task."""
        console.print()
        console.print(
            Panel.fit(
                "[bold cyan]UPDATE TASK[/bold cyan]",
                border_style="cyan",
            )
        )

        # First show all tasks
        tasks = self.operations.list_tasks()
        self.display_tasks(tasks)

        if not tasks:
            return

        task_id = self.prompt_task_id("update")

        console.print()
        console.print("[dim]Press Enter to keep current value[/dim]")
        title_input = Prompt.ask("[bold cyan]New title[/bold cyan]", default="")
        description_input = Prompt.ask("[bold cyan]New description[/bold cyan]", default="")

        # Convert empty strings to None
        title: str | None = title_input if title_input else None
        description: str | None = description_input if description_input else None

        task, message = self.operations.update_task(task_id, title, description)

        console.print()
        if task:
            console.print(f"[bold green]✓[/bold green] {message}")
        else:
            console.print(f"[bold red]✗[/bold red] {message}")

    def _handle_delete_task(self) -> None:
        """Handle deleting a task."""
        console.print()
        console.print(
            Panel.fit(
                "[bold red]DELETE TASK[/bold red]",
                border_style="red",
            )
        )

        # First show all tasks
        tasks = self.operations.list_tasks()
        self.display_tasks(tasks)

        if not tasks:
            return

        task_id = self.prompt_task_id("delete")

        # Confirm deletion
        console.print()
        confirm = Confirm.ask(
            f"[bold yellow]Are you sure you want to delete task #{task_id}?[/bold yellow]"
        )

        if confirm:
            _, message = self.operations.delete_task(task_id)
            console.print()
            console.print(f"[bold green]✓[/bold green] {message}")
        else:
            console.print()
            console.print("[dim]Deletion cancelled.[/dim]")

    def _handle_mark_complete(self) -> None:
        """Handle marking a task as complete/pending."""
        console.print()
        console.print(
            Panel.fit(
                "[bold yellow]MARK TASK AS COMPLETE/PENDING[/bold yellow]",
                border_style="yellow",
            )
        )

        # First show all tasks
        tasks = self.operations.list_tasks()
        self.display_tasks(tasks)

        if not tasks:
            return

        task_id = self.prompt_task_id("toggle")
        task, message = self.operations.toggle_task_complete(task_id)

        console.print()
        if task:
            console.print(f"[bold green]✓[/bold green] {message}")
        else:
            console.print(f"[bold red]✗[/bold red] {message}")
