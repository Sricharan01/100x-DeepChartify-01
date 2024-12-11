# Data Analysis Platform

A comprehensive web application for data analysis and visualization built with React, TypeScript, and Tailwind CSS. This platform allows users to upload various data file formats, analyze them using AI, and generate interactive visualizations.

## Features

- 📊 Multiple file format support (CSV, JSON, XLS, XLSX, PDF, TXT)
- 🤖 AI-powered data analysis using Hugging Face's LLaMA model
- 📈 Interactive data visualizations with Chart.js
- 📑 PDF text extraction and OCR capabilities
- 💾 Multiple export formats (PDF, DOCX, Image, JSON)
- 📋 Copy-to-clipboard functionality
- 📱 Responsive design

## Project Structure

### Core Components

```
src/
├── components/           # React components
│   ├── AIAnalysis/      # AI analysis components
│   ├── FileUpload/      # File upload components
│   ├── GraphControls/   # Graph customization components
│   └── Export/          # Export functionality components
├── services/            # API and service integrations
├── types/               # TypeScript type definitions
└── utils/               # Utility functions
```

### Key Files and Their Responsibilities

#### Components

- `App.tsx`: Main application component and routing
- `Header.tsx`: Navigation and branding
- `Hero.tsx`: Landing page hero section
- `Features.tsx`: Feature showcase section
- `DataUpload.tsx`: Main data upload and processing interface
- `AIAnalysis.tsx`: AI-powered data analysis interface
- `ChartDisplay.tsx`: Chart rendering and visualization
- `AnalysisResults.tsx`: Display of analysis results
- `CopyButton.tsx`: Copy-to-clipboard functionality

#### File Upload Components

- `FileUploadZone.tsx`: Drag-and-drop file upload interface
- `FilePreview.tsx`: Uploaded file preview and management

#### Graph Control Components

- `InteractiveGraphControls.tsx`: Graph customization interface
- `ChartTypeSelector.tsx`: Chart type selection
- `ColumnSelector.tsx`: Data column selection

#### Export Components

- `ExportButton.tsx`: Export functionality for various formats

#### Services

- `aiService.ts`: AI analysis integration with Hugging Face
- `analysisService.ts`: Data analysis service

#### Types

- `analysisTypes.ts`: Analysis-related type definitions
- `fileTypes.ts`: File handling type definitions

#### Utilities

- `fileProcessing.ts`: File parsing and processing
- `chartUtils.ts`: Chart generation utilities
- `statisticsUtils.ts`: Statistical calculations
- `exportUtils.ts`: Export functionality
- `pdfUtils.ts`: PDF processing utilities
- `promptUtils.ts`: AI prompt generation
- `analysisUtils.ts`: Analysis result parsing
- `pdfWorker.ts`: PDF.js worker initialization

## Technical Details

### File Processing

- Supports multiple file formats through specialized parsers
- Handles large files efficiently
- Provides progress tracking during processing
- Implements error handling and validation

### AI Analysis

- Uses LLaMA 3.2-3B-Instruct model
- Generates comprehensive analysis with:
  - Data summaries
  - Key findings
  - Trend analysis
  - Correlation detection
  - Recommendations

### Visualization

- Interactive chart customization
- Multiple chart types:
  - Bar charts
  - Line charts
  - Scatter plots
  - Pie charts
- Dynamic data mapping
- Responsive design

### Export Options

- PDF export with charts and analysis
- Word document export
- Image export of visualizations
- JSON export of complete analysis

## Dependencies

- React 18.2.0
- TypeScript 5.2.2
- Tailwind CSS 3.4.1
- Chart.js 4.4.6
- PDF.js
- Tesseract.js
- Hugging Face Inference
- Various utility libraries

## Best Practices

- Component-based architecture
- TypeScript for type safety
- Error boundary implementation
- Progressive enhancement
- Responsive design
- Accessibility considerations
- Performance optimization

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open http://localhost:5173 in your browser

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE file for details