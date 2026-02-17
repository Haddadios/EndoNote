import {
  AlignmentType,
  Document,
  Footer,
  Header,
  ImageRun,
  Packer,
  Paragraph,
  TextRun,
  Table,
  BorderStyle,
  TableCell,
  TableRow,
  WidthType,
} from 'docx';
import type { NoteData, ReferralTemplate } from '../types';
import { buildReferralBlocks } from './referralLetterGenerator';

const inchesToTwips = (inches: number) => Math.round(inches * 1440);
const inchesToPixels = (inches: number) => Math.round(inches * 96);
const ptToHalfPoints = (pt: number) => Math.round(pt * 2);

const dataUrlToUint8Array = (dataUrl: string) => {
  const base64 = dataUrl.split(',')[1] || '';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

const alignmentMap = {
  left: AlignmentType.LEFT,
  center: AlignmentType.CENTER,
  right: AlignmentType.RIGHT,
} as const;

type RasterImageType = 'png' | 'jpg';

const getImageType = (dataUrl: string): RasterImageType => {
  const match = dataUrl.match(/^data:image\/(png|jpg|jpeg)/i);
  if (match && match[1]) {
    const ext = match[1].toLowerCase();
    return ext === 'jpeg' ? 'jpg' : (ext as RasterImageType);
  }
  return 'png';
};

const buildImageRun = (dataUrl: string, widthIn: number, heightIn: number) =>
  new ImageRun({
    data: dataUrlToUint8Array(dataUrl),
    transformation: {
      width: inchesToPixels(widthIn),
      height: inchesToPixels(heightIn),
    },
    type: getImageType(dataUrl),
  });

const resolveImageHeightIn = (widthIn: number, heightIn?: number, aspectRatio?: number) => {
  if (heightIn && heightIn > 0) return heightIn;
  if (aspectRatio && aspectRatio > 0) return widthIn / aspectRatio;
  return widthIn * 0.6;
};

const getAspectRatioFromDataUrl = (dataUrl: string) =>
  new Promise<number | undefined>((resolve) => {
    const img = new Image();
    img.onload = () => {
      if (img.naturalWidth > 0 && img.naturalHeight > 0) {
        resolve(img.naturalWidth / img.naturalHeight);
      } else {
        resolve(undefined);
      }
    };
    img.onerror = () => resolve(undefined);
    img.src = dataUrl;
  });

const fitBoxWithAspect = (boxWidthIn: number, boxHeightIn: number, aspectRatio?: number) => {
  if (!aspectRatio || aspectRatio <= 0) {
    return { widthIn: boxWidthIn, heightIn: boxHeightIn };
  }
  const boxRatio = boxWidthIn / boxHeightIn;
  if (boxRatio > aspectRatio) {
    const heightIn = boxHeightIn;
    const widthIn = heightIn * aspectRatio;
    return { widthIn, heightIn };
  }
  const widthIn = boxWidthIn;
  const heightIn = widthIn / aspectRatio;
  return { widthIn, heightIn };
};

const CM_TO_IN = 1 / 2.54;
const RADIO_MAX_LANDSCAPE = { widthIn: 5.87 * CM_TO_IN, heightIn: 4.19 * CM_TO_IN };
const RADIO_MAX_PORTRAIT = { widthIn: 3.7 * CM_TO_IN, heightIn: 5.21 * CM_TO_IN };

const lineToParagraph = (line: string, sizePt: number, children?: TextRun[]) => {
  if (!line.trim()) {
    return new Paragraph({ text: '' });
  }
  const leadingSpaces = (line.match(/^(\s+)/)?.[1].length ?? 0);
  const indentLevel = Math.floor(leadingSpaces / 2);
  const indentTwips = indentLevel > 0 ? inchesToTwips(0.25 * indentLevel) : 0;
  const size = ptToHalfPoints(sizePt);
  const runs = children ?? [new TextRun({ text: line.trim(), size })];
  return new Paragraph({
    children: runs,
    indent: indentTwips ? { left: indentTwips } : undefined,
  });
};

const boldLabelRuns = (line: string, labels: string[], sizePt: number) => {
  const trimmed = line.trim();
  const label = labels.find((candidate) => trimmed.startsWith(`${candidate}:`));
  const size = ptToHalfPoints(sizePt);
  if (!label) return [new TextRun({ text: trimmed, size })];

  const remainder = trimmed.slice(label.length + 1).trimStart();
  const runs = [new TextRun({ text: `${label}:`, bold: true, size })];
  if (remainder) runs.push(new TextRun({ text: ` ${remainder}`, size }));
  return runs;
};

const boldTokenRuns = (text: string, token: string, sizePt: number) => {
  const size = ptToHalfPoints(sizePt);
  if (!token) return [new TextRun({ text, size })];
  const index = text.indexOf(token);
  if (index === -1) return [new TextRun({ text, size })];
  const before = text.slice(0, index);
  const after = text.slice(index + token.length);
  const runs: TextRun[] = [];
  if (before) runs.push(new TextRun({ text: before, size }));
  runs.push(new TextRun({ text: token, bold: true, size }));
  if (after) runs.push(new TextRun({ text: after, size }));
  return runs;
};

const buildHeader = (template: ReferralTemplate) => {
  const blocks = template.headerBlocks.filter(
    (block) => block.enabled && (block.text.trim() || block.logo?.dataUrl)
  );
  if (blocks.length === 0) return undefined;

  const children: (Paragraph | Table)[] = [];
  const layout = template.headerLayout;

  blocks.forEach((block) => {
    const alignment = alignmentMap[block.align];
    if (layout === 'logo_left_text_right') {
      const borderNone = {
        top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      };
      const textLines = block.text.trim() ? block.text.split('\n') : [''];

      const logoCellChildren: Paragraph[] = [];
      if (block.logo?.dataUrl) {
        logoCellChildren.push(
          new Paragraph({
            alignment: AlignmentType.LEFT,
            children: [
              buildImageRun(
                block.logo.dataUrl,
                block.logo.widthIn,
                resolveImageHeightIn(block.logo.widthIn, block.logo.heightIn, block.logo.aspectRatio)
              ),
            ],
          })
        );
      } else {
        logoCellChildren.push(new Paragraph({ text: '' }));
      }

      const textCellChildren: Paragraph[] = textLines.map(
        (line) =>
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [new TextRun({ text: line, size: ptToHalfPoints(template.headerFontSizePt) })],
          })
      );

      children.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 35, type: WidthType.PERCENTAGE },
                  borders: borderNone,
                  children: logoCellChildren,
                }),
                new TableCell({
                  width: { size: 65, type: WidthType.PERCENTAGE },
                  borders: borderNone,
                  children: textCellChildren,
                }),
              ],
            }),
          ],
        })
      );
      return;
    }

    const blockAlignment = layout === 'stacked_center' ? AlignmentType.CENTER : alignment;

    if (block.logo?.dataUrl) {
      children.push(
        new Paragraph({
          alignment: blockAlignment,
          children: [
            buildImageRun(
              block.logo.dataUrl,
              block.logo.widthIn,
              resolveImageHeightIn(block.logo.widthIn, block.logo.heightIn, block.logo.aspectRatio)
            ),
          ],
        })
      );
    }

    if (block.text.trim()) {
      block.text.split('\n').forEach((line) => {
        children.push(
          new Paragraph({
            alignment: blockAlignment,
            children: [new TextRun({ text: line, size: ptToHalfPoints(template.headerFontSizePt) })],
          })
        );
      });
    }
  });

  if (children.length === 0) return undefined;
  return new Header({ children });
};

const buildFooter = (template: ReferralTemplate) => {
  if (!template.footer.enabled && !template.footerImage?.dataUrl) return undefined;
  const children: Paragraph[] = [];
  const alignment = alignmentMap[template.footer.align];

  const addFooterImage = () => {
    if (!template.footerImage?.dataUrl) return;
    const footerAlign = alignmentMap[template.footerImage.align];
    children.push(
      new Paragraph({
        alignment: footerAlign,
        children: [
          buildImageRun(
            template.footerImage.dataUrl,
            template.footerImage.widthIn,
            resolveImageHeightIn(
              template.footerImage.widthIn,
              template.footerImage.heightIn,
              template.footerImage.aspectRatio
            )
          ),
        ],
      })
    );
  };

  if (template.footer.enabled && template.footerImagePlacement === 'above_text') {
    addFooterImage();
  }

  if (template.footer.enabled && template.footer.text.trim()) {
    template.footer.text.split('\n').forEach((line) => {
      children.push(
        new Paragraph({
          alignment,
          children: [new TextRun({ text: line, size: ptToHalfPoints(template.footerFontSizePt) })],
        })
      );
    });
  }

  if (template.footer.enabled && template.footerImagePlacement === 'below_text') {
    addFooterImage();
  }

  if (children.length === 0) return undefined;
  return new Footer({ children });
};

const buildRadiographTable = async (
  template: ReferralTemplate,
  images: string[],
  slotWidthIn: number,
  slotHeightIn: number
) => {
  if (!template.radiographs.enabled || template.radiographs.slots <= 0) return null;
  const columns = Math.max(1, template.radiographs.columns);
  const rows = Math.ceil(template.radiographs.slots / columns);
  const cellWidth = inchesToTwips(slotWidthIn);
  const labelHeightIn = 0.25;
  const paddingWidthIn = 0.1;
  const maxImageWidthIn = Math.max(0.1, slotWidthIn - paddingWidthIn);
  const maxImageHeightIn = Math.max(0.1, slotHeightIn - labelHeightIn);
  const borderNone = {
    top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  };
  const tableBorders = {
    top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    insideVertical: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  };

  const tableRows: TableRow[] = [];
  let imageIndex = 0;
  for (let r = 0; r < rows; r += 1) {
    const cells: TableCell[] = [];
    for (let c = 0; c < columns; c += 1) {
      const isWithinSlot = r * columns + c < template.radiographs.slots;
      let cellChildren: Paragraph[] = [new Paragraph({ text: '' })];
      if (isWithinSlot) {
        const img = images[imageIndex];
        const label =
          imageIndex === 0
            ? 'Pre-Treatment'
            : `Radiograph ${imageIndex}`;
        if (img) {
          const aspectRatio = await getAspectRatioFromDataUrl(img);
          const isLandscape = aspectRatio ? aspectRatio >= 1 : true;
          const maxDims = isLandscape ? RADIO_MAX_LANDSCAPE : RADIO_MAX_PORTRAIT;
          const allowedWidthIn = Math.min(maxImageWidthIn, maxDims.widthIn);
          const allowedHeightIn = Math.min(maxImageHeightIn, maxDims.heightIn);
          const fitted = fitBoxWithAspect(
            allowedWidthIn,
            allowedHeightIn,
            aspectRatio
          );
          cellChildren = [
            new Paragraph({
              children: [new TextRun({ text: label, bold: true, size: ptToHalfPoints(template.bodyFontSizePt) })],
              spacing: { after: 120 },
            }),
            new Paragraph({
              children: [
                buildImageRun(
                  img,
                  fitted.widthIn,
                  fitted.heightIn
                ),
              ],
              spacing: { after: 120 },
            }),
          ];
          imageIndex += 1;
        } else {
          cellChildren = [
            new Paragraph({
              children: [new TextRun({ text: label, bold: true, size: ptToHalfPoints(template.bodyFontSizePt) })],
              spacing: { after: 120 },
            }),
            new Paragraph({
              children: [new TextRun({ text: 'Radiograph', size: ptToHalfPoints(template.bodyFontSizePt) })],
              spacing: { after: 120 },
            }),
          ];
        }
      }

      cells.push(
        new TableCell({
          width: {
            size: cellWidth,
            type: WidthType.DXA,
          },
          borders: borderNone,
          margins: {
            top: 120,
            bottom: 120,
            left: 120,
            right: 120,
          },
          children: cellChildren,
        })
      );
    }
    tableRows.push(new TableRow({ children: cells }));
  }

  return new Table({
    width: {
      size: cellWidth * columns,
      type: WidthType.DXA,
    },
    borders: tableBorders,
    rows: tableRows,
  });
};

export async function buildReferralDocx(noteData: NoteData, template: ReferralTemplate) {
  const blocks = buildReferralBlocks(noteData, template.includePostOpInstructions);
  const children: (Paragraph | Table)[] = [];
  const boldLabels = [
    'Patient Name',
    'Patient Chart Number',
    'Patient DOB',
    'Date',
    'Tooth/Area',
    'Consultation Date',
    'Treatment Completion Date',
    'Comments',
  ];
  const patientNameToken = noteData.patientName || 'NAME';
  const bodySizePt = template.bodyFontSizePt;
  const pageWidthIn = 8.5;
  const pageHeightIn = 11;
  const contentWidthIn = pageWidthIn - template.page.marginsIn.left - template.page.marginsIn.right;
  const contentHeightIn = pageHeightIn - template.page.marginsIn.top - template.page.marginsIn.bottom;
  const lineHeightIn = (bodySizePt / 72) * 1.4;
  const charsPerLine = Math.max(20, Math.floor((contentWidthIn * 72) / (bodySizePt * 0.5)));

  const estimateLines = (text: string) =>
    text.split('\n').reduce((sum, line) => sum + Math.max(1, Math.ceil(line.length / charsPerLine)), 0);

  const pushSpacer = () => {
    children.push(new Paragraph({ text: '' }));
  };

  blocks.patientMeta.forEach((line) =>
    children.push(lineToParagraph(line, bodySizePt, boldLabelRuns(line, boldLabels, bodySizePt)))
  );
  pushSpacer();
  children.push(new Paragraph({ children: [new TextRun({ text: 'Dear Colleague,', size: ptToHalfPoints(bodySizePt) })] }));
  pushSpacer();
  children.push(new Paragraph({ children: boldTokenRuns(blocks.introParagraph, patientNameToken, bodySizePt) }));
  pushSpacer();
  children.push(new Paragraph({ children: boldLabelRuns(blocks.toothAreaLine, boldLabels, bodySizePt) }));
  pushSpacer();
  blocks.consultationLines.forEach((line) => {
    if (line.trim().startsWith('Consultation Date:')) {
      children.push(lineToParagraph(line, bodySizePt, boldLabelRuns(line, boldLabels, bodySizePt)));
    } else {
      children.push(lineToParagraph(line, bodySizePt));
    }
  });

  if (blocks.completionLines.length > 0) {
    pushSpacer();
    blocks.completionLines.forEach((line) => {
      if (line.trim().startsWith('Treatment Completion Date:')) {
        children.push(lineToParagraph(line, bodySizePt, boldLabelRuns(line, boldLabels, bodySizePt)));
      } else {
        children.push(lineToParagraph(line, bodySizePt));
      }
    });
  }

  pushSpacer();
  children.push(new Paragraph({ children: boldLabelRuns('Comments:', boldLabels, bodySizePt) }));
  children.push(
    new Paragraph({
      children: [new TextRun({ text: blocks.comments, size: ptToHalfPoints(bodySizePt) })],
      indent: { left: inchesToTwips(0.25) },
    })
  );
  pushSpacer();
  children.push(new Paragraph({ children: [new TextRun({ text: blocks.closing, size: ptToHalfPoints(bodySizePt) })] }));

  if (template.signature.enabled) {
    pushSpacer();
    if (template.signature.image?.dataUrl) {
      children.push(
        new Paragraph({
          children: [
            buildImageRun(
              template.signature.image.dataUrl,
              template.signature.image.widthIn,
              resolveImageHeightIn(
                template.signature.image.widthIn,
                template.signature.image.heightIn,
                template.signature.image.aspectRatio
              )
            ),
          ],
        })
      );
    }
    const trimmedLines = template.signature.lines.filter((line) => line.trim() !== '');
    const shouldPadSincerely =
      trimmedLines.length === 1 &&
      trimmedLines[0].trim().toLowerCase() === 'sincerely,';
    const signatureLines = shouldPadSincerely
      ? [...template.signature.lines, '', '']
      : template.signature.lines;
    signatureLines.forEach((line) =>
      children.push(new Paragraph({ children: [new TextRun({ text: line, size: ptToHalfPoints(bodySizePt) })] }))
    );
  }

  if (template.radiographs.enabled) {
    let estimatedLines = 0;
    estimatedLines += blocks.patientMeta.reduce((sum, line) => sum + estimateLines(line), 0);
    estimatedLines += 1; // spacer
    estimatedLines += 1; // Dear Colleague
    estimatedLines += 1; // spacer
    estimatedLines += estimateLines(blocks.introParagraph);
    estimatedLines += 1; // spacer
    estimatedLines += estimateLines(blocks.toothAreaLine);
    estimatedLines += 1; // spacer
    estimatedLines += blocks.consultationLines.reduce((sum, line) => sum + estimateLines(line.trim()), 0);
    if (blocks.completionLines.length > 0) {
      estimatedLines += 1; // spacer
      estimatedLines += blocks.completionLines.reduce((sum, line) => sum + estimateLines(line.trim()), 0);
    }
    estimatedLines += 1; // spacer before comments
    estimatedLines += 1; // Comments label
    estimatedLines += estimateLines(blocks.comments);
    estimatedLines += 1; // spacer
    estimatedLines += estimateLines(blocks.closing);

    if (template.signature.enabled) {
      estimatedLines += 1; // spacer before signature
      const trimmedLines = template.signature.lines.filter((line) => line.trim() !== '');
      const shouldPadSincerely =
        trimmedLines.length === 1 &&
        trimmedLines[0].trim().toLowerCase() === 'sincerely,';
      const signatureLines = shouldPadSincerely
        ? [...template.signature.lines, '', '']
        : template.signature.lines;
      estimatedLines += signatureLines.reduce((sum, line) => sum + estimateLines(line), 0);
    }

    let usedHeightIn = estimatedLines * lineHeightIn;
    if (template.signature.enabled && template.signature.image?.dataUrl) {
      usedHeightIn += resolveImageHeightIn(
        template.signature.image.widthIn,
        template.signature.image.heightIn,
        template.signature.image.aspectRatio
      );
    }

    const remainingHeightIn = Math.max(0.1, contentHeightIn - usedHeightIn);
    const rows = Math.ceil(template.radiographs.slots / Math.max(1, template.radiographs.columns));
    const maxSlotWidthIn = contentWidthIn / Math.max(1, template.radiographs.columns);
    const maxSlotHeightIn = remainingHeightIn / Math.max(1, rows);
    const scale = Math.max(
      1,
      Math.min(
        maxSlotWidthIn / template.radiographs.slotWidthIn,
        maxSlotHeightIn / template.radiographs.slotHeightIn
      )
    );
    const slotWidthIn = template.radiographs.slotWidthIn * scale;
    const slotHeightIn = template.radiographs.slotHeightIn * scale;

    const table = await buildRadiographTable(
      template,
      noteData.referralRadiographs,
      slotWidthIn,
      slotHeightIn
    );
    if (table) children.push(table);
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: inchesToTwips(template.page.marginsIn.top),
              right: inchesToTwips(template.page.marginsIn.right),
              bottom: inchesToTwips(template.page.marginsIn.bottom),
              left: inchesToTwips(template.page.marginsIn.left),
              footer: inchesToTwips(Math.max(0, template.page.marginsIn.bottom - 0.25)),
            },
          },
        },
        headers: {
          default: buildHeader(template),
        },
        footers: {
          default: buildFooter(template),
        },
        children,
      },
    ],
  });

  return Packer.toBlob(doc);
}
