# Accountant Form

A dynamic form application for accountants to collect client information. The form structure is controlled through Google Sheets, making it easy to modify without code changes.

## Setup

1. Create a Google Sheet with the following columns:
   - `label`: The field label
   - `description`: The field description
   - `section name`: The section this field belongs to

2. Make your Google Sheet public for read access

3. Create a `.env.local` file with:
```
NEXT_PUBLIC_DEFAULT_FORM_ID="your-google-sheet-id-here"
```

4. Install dependencies:
```bash
bun install
```

5. Run the development server:
```bash
bun dev
```

## Usage

### Default Form
Visit the root URL `/` to access the form using the first sheet (gid=0) in your Google Sheet.

### Multiple Forms
You can create multiple versions of the form by creating additional sheets in your Google Sheet. Access them using the sheet's GID in the URL:

```
/[gid]
```

For example:
- `/0` - First sheet
- `/1234567890` - Sheet with GID 1234567890

To find a sheet's GID:
1. Open your Google Sheet
2. Look at the URL when selecting different sheets
3. The GID is the number after `gid=` in the URL

## Query Parameters

The form supports the following query parameters:
- `client`: Pre-fill the client name
- `period`: Pre-fill the period field

Example:
```
/?client=ACME&period=2024-2025
