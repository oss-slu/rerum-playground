# Security Policy

## Supported Versions
This project is maintained by students and contributors within the Rerum and OSS SLU community. While not all versions may receive regular updates, we aim to keep the main branch stable and secure.

| Version | Supported |
|---------|-----------|
| main    | Yes       |

## Reporting a Vulnerability
If you discover a security vulnerability, please **do not open a public GitHub issue**.  
Instead, report it responsibly by contacting:

- **Project Maintainers:**  maintainer-name@slu.edu
- Or the instructor/maintainer associated with this repository

Please include:
- A description of the vulnerability  
- Steps to reproduce (if applicable)  
- Potential impact  
- Any suggested fixes  

We will review the report and respond as quickly as possible.

## Security Tools in Use
This repository uses the following automated tools to help detect vulnerabilities:

### **Dependabot**
- Automatically checks for outdated or vulnerable npm packages  
- Creates automated pull requests for safe upgrades  

### **GitHub Code Scanning**
- CodeQL analysis scans JavaScript code for common security issues  
- Results appear under the repository's **Security** tab  

### **npm audit**
- Dependency vulnerabilities can be evaluated locally using the command ```npm audit```

## Responsible Disclosure
Please give us reasonable time to investigate and address the issue before publicly disclosing it.  
We appreciate contributions that help keep this project safe for all users.
