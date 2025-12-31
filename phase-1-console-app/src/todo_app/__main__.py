"""Main entry point for the Todo application."""

from todo_app.cli import TodoCLI
from todo_app.operations import TodoOperations
from todo_app.storage import TaskStorage


def main() -> None:
    """Initialize and run the Todo application."""
    try:
        # Initialize components
        storage = TaskStorage()
        operations = TodoOperations(storage)
        cli = TodoCLI(operations)

        # Run the application
        cli.run()

    except KeyboardInterrupt:
        print("\n\nApplication interrupted. Goodbye!\n")
    except Exception as e:
        print(f"\n\nAn unexpected error occurred: {e}")
        print("The application will now exit.\n")


if __name__ == "__main__":
    main()
