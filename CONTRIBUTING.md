# Contributing to AgentOS Studio Strands

We welcome contributions to AgentOS Studio Strands! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### 1. Fork and Clone

```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/YOUR_USERNAME/AgentOS_Latest_Release.git
cd AgentOS_Latest_Release
```

### 2. Create a Feature Branch

```bash
git checkout -b feature/amazing-feature
# or
git checkout -b fix/bug-description
```

### 3. Make Your Changes

- Follow the existing code style and patterns
- Add comprehensive tests for new features
- Update documentation for any API changes
- Ensure all services remain healthy after changes

### 4. Test Your Changes

```bash
# Run tests
python -m pytest tests/
./scripts/testing/test-utility-services.py

# Test service health
./scripts/testing/health-monitor.sh

# Test specific functionality
./scripts/testing/comprehensive-a2a-test.py
```

### 5. Submit a Pull Request

- Create a clear, descriptive PR title
- Provide detailed description of changes
- Reference any related issues
- Ensure all tests pass

## 📋 Development Guidelines

### Code Style

#### Python
- Follow PEP 8 style guidelines
- Use type hints where appropriate
- Add docstrings for all functions and classes
- Maximum line length: 120 characters

#### TypeScript/JavaScript
- Use ESLint configuration
- Follow React best practices
- Use functional components with hooks
- Add JSDoc comments for complex functions

#### General
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused
- Follow the existing file structure

### Testing Requirements

#### Unit Tests
- Test all new functions and methods
- Aim for 80%+ code coverage
- Use descriptive test names
- Test both success and failure cases

#### Integration Tests
- Test service interactions
- Verify API endpoints
- Test database operations
- Validate agent orchestration

#### End-to-End Tests
- Test complete user workflows
- Verify frontend-backend integration
- Test utility services functionality

### Documentation

#### Code Documentation
- Add docstrings to all Python functions
- Add JSDoc comments to TypeScript functions
- Document complex algorithms and logic
- Update README files for significant changes

#### API Documentation
- Document all new API endpoints
- Provide example requests and responses
- Update OpenAPI specifications
- Include error handling documentation

## 🏗️ Architecture Guidelines

### Service Architecture
- Keep services loosely coupled
- Use clear interfaces between services
- Implement proper error handling
- Follow microservices principles

### Database Design
- Use proper normalization
- Add appropriate indexes
- Implement data validation
- Handle migrations properly

### Frontend Architecture
- Use React best practices
- Implement proper state management
- Follow component composition patterns
- Ensure responsive design

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Description**: Clear description of the issue
2. **Steps to Reproduce**: Detailed steps to reproduce the bug
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Environment**: OS, Python version, Node.js version
6. **Logs**: Relevant log files from `data/logs/`
7. **Screenshots**: If applicable

### Bug Report Template

```markdown
## Bug Description
[Clear description of the issue]

## Steps to Reproduce
1. [Step 1]
2. [Step 2]
3. [Step 3]

## Expected Behavior
[What should happen]

## Actual Behavior
[What actually happens]

## Environment
- OS: [e.g., macOS 13.0]
- Python: [e.g., 3.10.7]
- Node.js: [e.g., 18.17.0]
- Ollama: [e.g., 0.1.20]

## Logs
[Paste relevant log entries]

## Additional Context
[Any other relevant information]
```

## ✨ Feature Requests

When requesting features, please include:

1. **Use Case**: Why is this feature needed?
2. **Description**: Detailed description of the feature
3. **Acceptance Criteria**: What constitutes completion?
4. **Alternative Solutions**: Other ways to solve the problem
5. **Additional Context**: Any other relevant information

### Feature Request Template

```markdown
## Feature Description
[Clear description of the requested feature]

## Use Case
[Why is this feature needed? What problem does it solve?]

## Detailed Description
[Detailed explanation of the feature]

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Alternative Solutions
[Other ways to solve this problem]

## Additional Context
[Any other relevant information]
```

## 🔧 Development Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- Git
- Ollama

### Setup Development Environment

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/AgentOS_Latest_Release.git
cd AgentOS_Latest_Release

# Setup Python environment
python3 -m venv venv
source venv/bin/activate
pip install -r src/backend/requirements.txt
pip install -r requirements-dev.txt  # Development dependencies

# Setup Node.js environment
cd src/frontend
npm install
cd ../..

# Setup Ollama
ollama serve
ollama pull qwen3:1.7b
ollama pull llama3.1

# Run tests
python -m pytest tests/
```

### Development Workflow

1. **Create Feature Branch**: `git checkout -b feature/your-feature`
2. **Make Changes**: Implement your feature or fix
3. **Run Tests**: Ensure all tests pass
4. **Test Manually**: Verify functionality works
5. **Update Documentation**: Update relevant docs
6. **Commit Changes**: Use conventional commit messages
7. **Push Branch**: `git push origin feature/your-feature`
8. **Create PR**: Submit pull request

### Commit Message Format

Use conventional commit messages:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(database): add dynamic database selection
fix(api): resolve authentication issue
docs(readme): update installation instructions
```

## 📞 Getting Help

### Communication Channels

- **GitHub Issues**: For bug reports and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Pull Requests**: For code contributions

### Code Review Process

1. **Automated Checks**: CI/CD pipeline runs tests
2. **Review Assignment**: Maintainers review the PR
3. **Feedback**: Address any requested changes
4. **Approval**: Maintainer approves the PR
5. **Merge**: PR is merged into main branch

### Review Guidelines

#### For Contributors
- Respond to feedback promptly
- Make requested changes
- Ask questions if unclear
- Be patient with the review process

#### For Reviewers
- Be constructive and helpful
- Focus on code quality and functionality
- Explain reasoning for requested changes
- Approve when ready

## 📝 License

By contributing to AgentOS Studio Strands, you agree that your contributions will be licensed under the MIT License.

## 🙏 Recognition

Contributors will be recognized in:
- CONTRIBUTORS.md file
- Release notes
- Project documentation

Thank you for contributing to AgentOS Studio Strands! 🎉
