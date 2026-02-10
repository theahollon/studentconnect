# Testing Standards

## Structure

- **unit/** - Test individual components and utilities in isolation
- **integration/** - Test interactions between system parts
- **e2e/** - Test complete user workflows and exploratory testing

## Testing Approach

- **Collaborative testing:** Different team member writes tests than implementer
- **Pseudocode first:** Basic test outline before implementation begins
- **All tests must pass** before work is considered complete
- **Frequent commits** with passing tests for continuous feedback

## Commands

```bash
npm test          # Run all tests
npm run test:unit # Run unit tests only
npm run test:e2e  # Run end-to-end tests
```

## Required Dependencies

Install testing dependencies:
```bash
# For unit/integration tests (choose one)
npm install -D jest @testing-library/react @testing-library/jest-dom

# For end-to-end tests
npm install -D @playwright/test

# For Supabase testing
npm install -D @supabase/gotrue-js
```

## Guidelines

- Keep tests simple and focused
- Use descriptive test names
- Test both happy path and error cases
