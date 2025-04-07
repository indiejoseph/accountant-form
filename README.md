# Accountant Form

A modern web application built with Next.js for accountants to send document request forms to their clients. The form provides an organized way to collect various financial and business documents required for auditing purposes.

## Features

- Client and period information collection
- Organized document sections:
  - General management accounts
  - Statutory records
  - Property, Plant & Equipment
  - Accounts Receivables
  - Cash & Equivalent
  - Accounts Payables
  - Revenue
  - Administrative Expense
  - Payroll
  - Others
  - Consolidation
- Progress tracking
- File upload support with size and type validation
- Real-time form validation
- Responsive design

## Tech Stack

- [Next.js](https://nextjs.org/) - React framework
- [Mantine UI](https://mantine.dev/) - Component library
- [React Hook Form](https://react-hook-form.com/) - Form validation
- [Zod](https://zod.dev/) - Schema validation
- [TypeScript](https://www.typescriptlang.org/) - Type safety

## Getting Started

### Prerequisites

- Node.js 18+ or [Bun](https://bun.sh/)
- npm or bun package manager

### Installation

1. Clone the repository:
   ```bash
   git clone [your-repo-url]
   cd accountant-form
   ```

2. Install dependencies:
   ```bash
   # Using npm
   npm install

   # Using bun
   bun install
   ```

3. Run the development server:
   ```bash
   # Using npm
   npm run dev

   # Using bun
   bun dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage

1. Enter client name and period information
2. Navigate through different sections using the accordion
3. Upload required documents in each section
4. Track progress through the progress bar
5. Submit the form when all sections are completed

## Building for Production

This project is configured for static HTML export. When you build the project, it will generate static files in the `out` directory.

```bash
# Using npm
npm run build

# Using bun
bun run build
```

The static files will be generated in the `out` directory and can be deployed to any static hosting service.

## Deployment

You can deploy this application to various static hosting platforms:

### Cloudflare Pages

1. Push your code to GitHub
2. Log in to Cloudflare Dashboard
3. Go to Pages > Connect to Git
4. Select your repository
5. Configure your build settings:
   - Framework preset: Next.js
   - Build command: `npm run build`
   - Build output directory: `out`

### Other Static Hosting

Since this is a static export, you can deploy the contents of the `out` directory to any static hosting service like:
- Vercel
- Netlify
- GitHub Pages
- Any static file hosting

## Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js Documentation](https://nextjs.org/docs)
- [Mantine UI Documentation](https://mantine.dev/guides/next)
