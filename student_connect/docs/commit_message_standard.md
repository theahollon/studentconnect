# Commit message standard

To maintain a consistent commit history, this project follows a standardized commit message template. The format is based on [Conventional Commits](https://www.conventionalcommits.org/), which support a clear structure, improves readability and enables automated versioning.

## Format for Commit Messages

Our commit messages follow the following format:

type(scope): short description

[optional body]

[optional footer(s)]

## Example of commit messages

```text
feat(auth): add login validation

Added input checks to prevent invalid user logins
and improved error messages for failed attempts.

Co-authored-by: Full Name <username@example.com>

Closes #12
```

```text
docs(README): finished released_1.md documentation #6
```

## Commit Types

- **feat**: Introduction of a new feature.
- **fix**: Fixing a bug or issue.
- **docs**: Changes to documentation.
- **style**: Changes related to style/formatting (non-functional changes).
- **refactor**: Code changes that neither fix a bug nor add a feature, but improve code structure.
- **perf**: Performance improvements.
- **test**: Adding or improving tests.
- **build**: Changes that affect the build system or dependencies.
- **ci**: Changes to CI configuration.
- **chore**: Other changes that do not affect the code directly.
- **revert**: Reverting a previous commit.
- **security**: Implementation of security-related improvements.

## Scope

`<scope>` is optional but useful to specify which part of the code the change affects. The scopes
we use are

- **auth** autentication/login-system
- **ui** user interface, FXML, CSS
- **api** backend API or services
- **core** core logic/models
- **build** setup, Maven, project structure

## Description

The short description should be a one-line summary of the change

### (Optional) body

Use the body to explain why the change was made, and not how the change was implemented.

### (Optional) footers

We used the footers for additional information, such as references to issues or breaking changes

## Our checklist for Commit Messages

1. **Type** Is the type correct (e.g., `docs`, `refactor`)
2. **Scope** Does the commit have an appropriate scope?
3. **Description** Does the body explain why the change was made if necessary
4. **Footers** Are footers added if needed?