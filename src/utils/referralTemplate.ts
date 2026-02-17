import type { ReferralTemplate } from '../types';

export const defaultReferralTemplate: ReferralTemplate = {
  page: {
    marginsIn: {
      top: 0.5,
      right: 0.5,
      bottom: 0.5,
      left: 0.5,
    },
  },
  headerFontSizePt: 10,
  footerFontSizePt: 8,
  bodyFontSizePt: 9.5,
  headerLayout: 'logo_left_text_right',
  headerBlocks: [
    {
      id: 'header-1',
      enabled: true,
      text: '',
      align: 'left',
      logo: {
        dataUrl: '',
        widthIn: 2.5,
      },
    },
  ],
  header: {
    enabled: false,
    text: '',
    align: 'left',
  },
  footer: {
    enabled: false,
    text: '',
    align: 'center',
  },
  footerImage: {
    dataUrl: '',
    widthIn: 0.5,
    align: 'center',
  },
  footerImagePlacement: 'below_text',
  radiographs: {
    enabled: true,
    placement: 'after_completion',
    slots: 3,
    columns: 3,
    slotWidthIn: 2.31,
    slotHeightIn: 1.65,
  },
  includePostOpInstructions: false,
  signature: {
    enabled: true,
    lines: ['Sincerely,', ''],
  },
};

export const normalizeReferralTemplate = (template?: Partial<ReferralTemplate>): ReferralTemplate => {
  const hasHeaderBlocks = Array.isArray(template?.headerBlocks);
  const legacyHeader = template?.header ?? defaultReferralTemplate.header;
  const headerBlocksSource = hasHeaderBlocks
    ? template!.headerBlocks!
    : [
        {
          id: 'header-1',
          enabled: legacyHeader.enabled ?? defaultReferralTemplate.header.enabled,
          text: legacyHeader.text ?? defaultReferralTemplate.header.text,
          align: legacyHeader.align ?? defaultReferralTemplate.header.align,
          logo: legacyHeader.logo,
        },
      ];

  const normalizedHeaderBlocks = headerBlocksSource.map((block, index) => ({
    id: block.id || `header-${index + 1}`,
    enabled: block.enabled ?? true,
    text: block.text ?? '',
    align: block.align ?? 'left',
    logo: block.logo
      ? {
          ...block.logo,
          widthIn: Number.isFinite(block.logo.widthIn) ? block.logo.widthIn : 2.5,
        }
      : undefined,
  }));

  const merged: ReferralTemplate = {
    ...defaultReferralTemplate,
    ...template,
    page: {
      marginsIn: {
        ...defaultReferralTemplate.page.marginsIn,
        ...(template?.page?.marginsIn ?? {}),
      },
    },
    headerLayout: template?.headerLayout ?? defaultReferralTemplate.headerLayout,
    headerBlocks: normalizedHeaderBlocks,
    header: {
      ...defaultReferralTemplate.header,
      ...(template?.header ?? {}),
    },
    footer: {
      ...defaultReferralTemplate.footer,
      ...(template?.footer ?? {}),
    },
    footerImage: template?.footerImage
      ? {
          ...template.footerImage,
          align: template.footerImage.align ?? defaultReferralTemplate.footer.align,
        }
      : defaultReferralTemplate.footerImage,
    footerImagePlacement: template?.footerImagePlacement ?? defaultReferralTemplate.footerImagePlacement,
    radiographs: {
      ...defaultReferralTemplate.radiographs,
      ...(template?.radiographs ?? {}),
    },
    includePostOpInstructions: template?.includePostOpInstructions ?? defaultReferralTemplate.includePostOpInstructions,
    signature: {
      ...defaultReferralTemplate.signature,
      ...(template?.signature ?? {}),
    },
  };

  if (merged.headerBlocks.length > 0) {
    const firstBlock = merged.headerBlocks[0];
    merged.header = {
      enabled: firstBlock.enabled,
      text: firstBlock.text,
      align: firstBlock.align,
      logo: firstBlock.logo,
    };
  }

  if (!Number.isFinite(merged.headerFontSizePt) || merged.headerFontSizePt <= 0) {
    merged.headerFontSizePt = defaultReferralTemplate.headerFontSizePt;
  }
  if (!Number.isFinite(merged.footerFontSizePt) || merged.footerFontSizePt <= 0) {
    merged.footerFontSizePt = defaultReferralTemplate.footerFontSizePt;
  }
  if (!Number.isFinite(merged.bodyFontSizePt) || merged.bodyFontSizePt <= 0) {
    merged.bodyFontSizePt = defaultReferralTemplate.bodyFontSizePt;
  }

  if (merged.radiographs.columns < 1) merged.radiographs.columns = 1;
  if (merged.radiographs.slots < 0) merged.radiographs.slots = 0;

  return merged;
};
