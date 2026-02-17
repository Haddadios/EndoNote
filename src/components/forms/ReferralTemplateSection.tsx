import { useEffect, useMemo } from 'react';
import { useNote } from '../../context/NoteContext';
import { defaultReferralTemplate } from '../../utils/referralTemplate';
import { buildReferralBlocks } from '../../utils/referralLetterGenerator';
import type { ReferralTemplateHeaderBlock } from '../../types';

const toNumber = (value: string, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

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

const createHeaderBlock = (): ReferralTemplateHeaderBlock => ({
  id:
    (typeof globalThis.crypto !== 'undefined' && 'randomUUID' in globalThis.crypto
      ? globalThis.crypto.randomUUID()
      : `header-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
  enabled: true,
  text: '',
  align: 'left',
});

export function ReferralTemplateSection() {
  const { referralTemplate, updateReferralTemplate, noteData } = useNote();

  const marginValues = useMemo(() => referralTemplate.page.marginsIn, [referralTemplate.page.marginsIn]);
  const radiographSlots = Math.max(0, referralTemplate.radiographs.slots);
  const radiographColumns = Math.max(1, referralTemplate.radiographs.columns);
  const previewBlocks = useMemo(
    () => buildReferralBlocks(noteData, referralTemplate.includePostOpInstructions),
    [noteData, referralTemplate.includePostOpInstructions]
  );
  const patientNameToken = noteData.patientName || 'NAME';
  const boldLabels = useMemo(
    () => [
      'Patient Name',
      'Patient Chart Number',
      'Patient DOB',
      'Date',
      'Tooth/Area',
      'Consultation Date',
      'Treatment Completion Date',
      'Comments',
    ],
    []
  );

  const updateTemplate = (next: typeof referralTemplate) => {
    updateReferralTemplate(next);
  };

  useEffect(() => {
    const hydrateAspectRatios = async () => {
      let updated = false;
      const nextHeaderBlocks = await Promise.all(
        referralTemplate.headerBlocks.map(async (block) => {
          if (!block.logo?.dataUrl || block.logo.aspectRatio) return block;
          const aspectRatio = await getAspectRatioFromDataUrl(block.logo.dataUrl);
          if (!aspectRatio) return block;
          updated = true;
          return {
            ...block,
            logo: {
              ...block.logo,
              aspectRatio,
              heightIn: block.logo.widthIn / aspectRatio,
            },
          };
        })
      );

      let nextFooterImage = referralTemplate.footerImage;
      if (nextFooterImage?.dataUrl && !nextFooterImage.aspectRatio) {
        const aspectRatio = await getAspectRatioFromDataUrl(nextFooterImage.dataUrl);
        if (aspectRatio) {
          updated = true;
          nextFooterImage = {
            ...nextFooterImage,
            aspectRatio,
            heightIn: nextFooterImage.widthIn / aspectRatio,
          };
        }
      }

      let nextSignatureImage = referralTemplate.signature.image;
      if (nextSignatureImage?.dataUrl && !nextSignatureImage.aspectRatio) {
        const aspectRatio = await getAspectRatioFromDataUrl(nextSignatureImage.dataUrl);
        if (aspectRatio) {
          updated = true;
          nextSignatureImage = {
            ...nextSignatureImage,
            aspectRatio,
            heightIn: nextSignatureImage.widthIn / aspectRatio,
          };
        }
      }

      if (!updated) return;
      updateTemplate({
        ...referralTemplate,
        headerBlocks: nextHeaderBlocks,
        footerImage: nextFooterImage,
        signature: {
          ...referralTemplate.signature,
          image: nextSignatureImage,
        },
      });
    };

    void hydrateAspectRatios();
  }, [
    referralTemplate.headerBlocks,
    referralTemplate.footerImage,
    referralTemplate.signature,
    updateTemplate,
    referralTemplate,
  ]);

  const updateMargins = (key: keyof typeof marginValues, value: string) => {
    updateTemplate({
      ...referralTemplate,
      page: {
        ...referralTemplate.page,
        marginsIn: {
          ...referralTemplate.page.marginsIn,
          [key]: toNumber(value, referralTemplate.page.marginsIn[key]),
        },
      },
    });
  };

  const updateHeaderBlock = (id: string, updater: (block: ReferralTemplateHeaderBlock) => ReferralTemplateHeaderBlock) => {
    updateTemplate({
      ...referralTemplate,
      headerBlocks: referralTemplate.headerBlocks.map((block) => (block.id === id ? updater(block) : block)),
    });
  };

  const moveHeaderBlock = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= referralTemplate.headerBlocks.length) return;
    const nextBlocks = [...referralTemplate.headerBlocks];
    const [moved] = nextBlocks.splice(fromIndex, 1);
    nextBlocks.splice(toIndex, 0, moved);
    updateTemplate({
      ...referralTemplate,
      headerBlocks: nextBlocks,
    });
  };

  const addHeaderBlock = () => {
    updateTemplate({
      ...referralTemplate,
      headerBlocks: [...referralTemplate.headerBlocks, createHeaderBlock()],
    });
  };

  const handleHeaderLogoUpload = async (blockId: string, file: File) => {
    const dataUrl = await readFileAsDataUrl(file);
    const img = new Image();
    const imageMeta = await new Promise<{ width: number; height: number }>((resolve, reject) => {
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => reject(new Error('Unable to load image.'));
      img.src = dataUrl;
    });
    const aspectRatio = imageMeta.width > 0 ? imageMeta.width / imageMeta.height : undefined;
    updateHeaderBlock(blockId, (block) => {
      const widthIn = block.logo?.widthIn ?? 2.5;
      const heightIn = aspectRatio ? widthIn / aspectRatio : block.logo?.heightIn;
      return {
        ...block,
        logo: {
          dataUrl,
          widthIn,
          heightIn,
          aspectRatio,
        },
      };
    });
  };

  const handleFooterImageUpload = async (file: File) => {
    const dataUrl = await readFileAsDataUrl(file);
    const img = new Image();
    const imageMeta = await new Promise<{ width: number; height: number }>((resolve, reject) => {
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => reject(new Error('Unable to load image.'));
      img.src = dataUrl;
    });
    const aspectRatio = imageMeta.width > 0 ? imageMeta.width / imageMeta.height : undefined;
    const widthIn = referralTemplate.footerImage?.widthIn ?? 0.5;
    const heightIn = aspectRatio ? widthIn / aspectRatio : referralTemplate.footerImage?.heightIn;
    updateTemplate({
      ...referralTemplate,
      footerImage: {
        dataUrl,
        widthIn,
        heightIn,
        aspectRatio,
        align: referralTemplate.footerImage?.align ?? referralTemplate.footer.align,
      },
    });
  };

  const handleSignatureUpload = async (file: File) => {
    const dataUrl = await readFileAsDataUrl(file);
    const img = new Image();
    const imageMeta = await new Promise<{ width: number; height: number }>((resolve, reject) => {
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => reject(new Error('Unable to load image.'));
      img.src = dataUrl;
    });
    const aspectRatio = imageMeta.width > 0 ? imageMeta.width / imageMeta.height : undefined;
    const widthIn = referralTemplate.signature.image?.widthIn ?? 2;
    const heightIn = aspectRatio ? widthIn / aspectRatio : referralTemplate.signature.image?.heightIn;
    updateTemplate({
      ...referralTemplate,
      signature: {
        ...referralTemplate.signature,
        image: {
          dataUrl,
          widthIn,
          heightIn,
          aspectRatio,
        },
      },
    });
  };

  const renderLineWithBoldLabel = (line: string) => {
    const trimmed = line.trim();
    const label = boldLabels.find((candidate) => trimmed.startsWith(`${candidate}:`));
    if (!label) return trimmed;
    const remainder = trimmed.slice(label.length + 1).trimStart();
    return (
      <>
        <strong>{label}:</strong>
        {remainder ? ` ${remainder}` : ''}
      </>
    );
  };

  const renderIntroParagraph = () => {
    const text = previewBlocks.introParagraph;
    const index = text.indexOf(patientNameToken);
    if (index === -1) return text;
    return (
      <>
        {text.slice(0, index)}
        <strong>{patientNameToken}</strong>
        {text.slice(index + patientNameToken.length)}
      </>
    );
  };

  const renderHeaderBlock = (block: ReferralTemplateHeaderBlock) => {
    const baseLogo = block.logo?.dataUrl ? (
      <img
        src={block.logo.dataUrl}
        alt="Header Logo"
        style={{
          width: `${block.logo.widthIn}in`,
          height: block.logo.heightIn ? `${block.logo.heightIn}in` : 'auto',
          display: 'block',
        }}
      />
    ) : null;

    if (referralTemplate.headerLayout === 'logo_left_text_right') {
      return (
        <div key={block.id} className="grid grid-cols-[auto_1fr] items-start gap-4 w-full">
          <div style={{ justifySelf: 'start' }}>{baseLogo}</div>
          {block.text.trim() && (
            <div
              className="whitespace-pre-line"
              style={{ textAlign: 'right', justifySelf: 'end', fontSize: `${referralTemplate.headerFontSizePt}pt` }}
            >
              {block.text}
            </div>
          )}
        </div>
      );
    }

    const alignment = referralTemplate.headerLayout === 'stacked_center' ? 'center' : block.align;
    const logo = baseLogo
      ? (
        <img
          src={block.logo!.dataUrl}
          alt="Header Logo"
          style={{
            width: `${block.logo!.widthIn}in`,
            height: block.logo!.heightIn ? `${block.logo!.heightIn}in` : 'auto',
            display: 'block',
            marginLeft: alignment === 'left' ? 0 : 'auto',
            marginRight: alignment === 'right' ? 0 : 'auto',
          }}
        />
      )
      : null;
    return (
      <div key={block.id}>
        {logo}
        {block.text.trim() && (
          <div
            className="whitespace-pre-line"
            style={{ textAlign: alignment, fontSize: `${referralTemplate.headerFontSizePt}pt` }}
          >
            {block.text}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Referral Template</h2>
        <button
          type="button"
          onClick={() => updateTemplate(defaultReferralTemplate)}
          className="text-xs px-3 py-1 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          Reset Referral Form
        </button>
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Page Margins (inches)</h3>
        <div className="grid grid-cols-2 gap-3">
          {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
            <label key={side} className="text-xs text-gray-600 dark:text-gray-300">
              {side.charAt(0).toUpperCase() + side.slice(1)}
              <input
                type="number"
                min={0}
                step={0.1}
                value={marginValues[side]}
                onChange={(e) => updateMargins(side, e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              />
            </label>
          ))}
        </div>
      </div>

      <div className="mb-4 border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Header Blocks</h3>
          <button
            type="button"
            onClick={addHeaderBlock}
            className="text-xs px-3 py-1 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            Add Block
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <label className="text-xs text-gray-600 dark:text-gray-300">
            Header Layout
            <select
              value={referralTemplate.headerLayout}
              onChange={(e) =>
                updateTemplate({
                  ...referralTemplate,
                  headerLayout: e.target.value as typeof referralTemplate.headerLayout,
                })
              }
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            >
              <option value="single_column">Single Column</option>
              <option value="logo_left_text_right">Logo Left + Text Right</option>
              <option value="stacked_center">Stacked Center</option>
            </select>
          </label>
          <label className="text-xs text-gray-600 dark:text-gray-300">
            Header Font Size (pt)
            <input
              type="number"
              min={6}
              step={0.5}
              value={referralTemplate.headerFontSizePt}
              onChange={(e) =>
                updateTemplate({
                  ...referralTemplate,
                  headerFontSizePt: toNumber(e.target.value, referralTemplate.headerFontSizePt),
                })
              }
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            />
          </label>
        </div>

        <div className="space-y-3">
          {referralTemplate.headerBlocks.map((block, index) => (
            <div key={block.id} className="rounded-md border border-gray-200 dark:border-gray-700 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <input
                    id={`header-block-${block.id}`}
                    type="checkbox"
                    checked={block.enabled}
                    onChange={(e) =>
                      updateHeaderBlock(block.id, (prev) => ({ ...prev, enabled: e.target.checked }))
                    }
                  />
                  <label htmlFor={`header-block-${block.id}`} className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Block {index + 1}
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => moveHeaderBlock(index, index - 1)}
                    disabled={index === 0}
                    className="text-xs px-2 py-1 rounded-md border border-gray-300 text-gray-700 disabled:opacity-50 dark:border-gray-600 dark:text-gray-200"
                  >
                    Up
                  </button>
                  <button
                    type="button"
                    onClick={() => moveHeaderBlock(index, index + 1)}
                    disabled={index === referralTemplate.headerBlocks.length - 1}
                    className="text-xs px-2 py-1 rounded-md border border-gray-300 text-gray-700 disabled:opacity-50 dark:border-gray-600 dark:text-gray-200"
                  >
                    Down
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      updateTemplate({
                        ...referralTemplate,
                        headerBlocks: referralTemplate.headerBlocks.filter((b) => b.id !== block.id),
                      })
                    }
                    className="text-xs px-2 py-1 rounded-md border border-red-300 text-red-600 hover:bg-red-50 dark:border-red-500 dark:text-red-400"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <textarea
                value={block.text}
                onChange={(e) => updateHeaderBlock(block.id, (prev) => ({ ...prev, text: e.target.value }))}
                rows={3}
                placeholder="Header text (one line per row)"
                className="mb-3 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <label className="text-xs text-gray-600 dark:text-gray-300">
                  Alignment
                  <select
                    value={block.align}
                    onChange={(e) =>
                      updateHeaderBlock(block.id, (prev) => ({
                        ...prev,
                        align: e.target.value as 'left' | 'center' | 'right',
                      }))
                    }
                    className="mt-1 w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </label>
                <label className="text-xs text-gray-600 dark:text-gray-300">
                  Logo Width (in)
                  <input
                    type="number"
                    min={0.5}
                    step={0.1}
                    value={block.logo?.widthIn ?? 2.5}
                    onChange={(e) =>
                      updateHeaderBlock(block.id, (prev) => ({
                        ...prev,
                        logo: prev.logo
                          ? {
                              ...prev.logo,
                              widthIn: toNumber(e.target.value, 2.5),
                              heightIn: prev.logo.aspectRatio
                                ? toNumber(e.target.value, 2.5) / prev.logo.aspectRatio
                                : prev.logo.heightIn,
                            }
                          : { dataUrl: '', widthIn: toNumber(e.target.value, 2.5) },
                      }))
                    }
                    className="mt-1 w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                  />
                </label>
                <label className="text-xs text-gray-600 dark:text-gray-300">
                  Logo Height (in)
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    value={block.logo?.heightIn ?? ''}
                    onChange={(e) => {
                      const nextValue = e.target.value;
                      updateHeaderBlock(block.id, (prev) => ({
                        ...prev,
                        logo: prev.logo
                          ? {
                              ...prev.logo,
                              heightIn: nextValue === '' ? undefined : toNumber(nextValue, prev.logo?.heightIn ?? 0.6),
                              aspectRatio:
                                nextValue === '' || !prev.logo?.widthIn
                                  ? prev.logo?.aspectRatio
                                  : prev.logo.widthIn / toNumber(nextValue, prev.logo.heightIn ?? 0.6),
                            }
                          : {
                              dataUrl: '',
                              widthIn: 2.5,
                              heightIn: nextValue === '' ? undefined : toNumber(nextValue, 0.6),
                              aspectRatio:
                                nextValue === '' ? undefined : 2.5 / toNumber(nextValue, 0.6),
                            },
                      }));
                    }}
                    className="mt-1 w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                  />
                </label>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <label className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm hover:bg-gray-50 cursor-pointer dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100">
                  <span>{block.logo?.dataUrl ? 'Replace Header Logo' : 'Upload Header Logo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void handleHeaderLogoUpload(block.id, file);
                    }}
                    className="sr-only"
                  />
                </label>
                {block.logo?.dataUrl && (
                  <button
                    type="button"
                    onClick={() => updateHeaderBlock(block.id, (prev) => ({ ...prev, logo: undefined }))}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Remove Logo
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-4 border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="flex items-center gap-2 mb-3">
          <input
            id="referral-footer-enabled"
            type="checkbox"
            checked={referralTemplate.footer.enabled}
            onChange={(e) =>
              updateTemplate({
                ...referralTemplate,
                footer: { ...referralTemplate.footer, enabled: e.target.checked },
              })
            }
          />
          <label htmlFor="referral-footer-enabled" className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            Footer
          </label>
        </div>

        <textarea
          value={referralTemplate.footer.text}
          onChange={(e) =>
            updateTemplate({
              ...referralTemplate,
              footer: { ...referralTemplate.footer, text: e.target.value },
            })
          }
          rows={2}
          placeholder="Footer text (one line per row)"
          className="mb-3 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
        />

        <label className="text-xs text-gray-600 dark:text-gray-300">
          Alignment
          <select
            value={referralTemplate.footer.align}
            onChange={(e) =>
              updateTemplate({
                ...referralTemplate,
                footer: { ...referralTemplate.footer, align: e.target.value as 'left' | 'center' | 'right' },
              })
            }
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </label>
        <label className="text-xs text-gray-600 dark:text-gray-300 mt-3 block">
          Footer Font Size (pt)
          <input
            type="number"
            min={6}
            step={0.5}
            value={referralTemplate.footerFontSizePt}
            onChange={(e) =>
              updateTemplate({
                ...referralTemplate,
                footerFontSizePt: toNumber(e.target.value, referralTemplate.footerFontSizePt),
              })
            }
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          />
        </label>

        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
          <label className="text-xs text-gray-600 dark:text-gray-300">
            Footer Image Align
            <select
              value={referralTemplate.footerImage?.align ?? referralTemplate.footer.align}
              onChange={(e) =>
                updateTemplate({
                  ...referralTemplate,
                  footerImage: referralTemplate.footerImage
                    ? { ...referralTemplate.footerImage, align: e.target.value as 'left' | 'center' | 'right' }
                    : { dataUrl: '', widthIn: 0.5, align: e.target.value as 'left' | 'center' | 'right' },
                })
              }
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </label>
          <label className="text-xs text-gray-600 dark:text-gray-300">
            Footer Image Placement
            <select
              value={referralTemplate.footerImagePlacement}
              onChange={(e) =>
                updateTemplate({
                  ...referralTemplate,
                  footerImagePlacement: e.target.value as typeof referralTemplate.footerImagePlacement,
                })
              }
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            >
              <option value="above_text">Image Above Text</option>
              <option value="below_text">Image Below Text</option>
            </select>
          </label>
          <label className="text-xs text-gray-600 dark:text-gray-300">
            Footer Image Width (in)
            <input
              type="number"
              min={0.5}
              step={0.1}
              value={referralTemplate.footerImage?.widthIn ?? 0.5}
              onChange={(e) =>
                updateTemplate({
                  ...referralTemplate,
                  footerImage: referralTemplate.footerImage
                    ? {
                        ...referralTemplate.footerImage,
                        widthIn: toNumber(e.target.value, 0.5),
                        heightIn: referralTemplate.footerImage.aspectRatio
                          ? toNumber(e.target.value, 0.5) / referralTemplate.footerImage.aspectRatio
                          : referralTemplate.footerImage.heightIn,
                      }
                    : { dataUrl: '', widthIn: toNumber(e.target.value, 0.5), align: referralTemplate.footer.align },
                })
              }
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            />
          </label>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm hover:bg-gray-50 cursor-pointer dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100">
            <span>{referralTemplate.footerImage?.dataUrl ? 'Replace Footer Image' : 'Upload Footer Image'}</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleFooterImageUpload(file);
              }}
              className="sr-only"
            />
          </label>
          {referralTemplate.footerImage?.dataUrl && (
            <button
              type="button"
              onClick={() =>
                updateTemplate({
                  ...referralTemplate,
                  footerImage: undefined,
                })
              }
              className="text-xs text-red-600 hover:underline"
            >
              Remove Footer Image
            </button>
          )}
        </div>
      </div>

      <div className="mb-4 border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="flex items-center gap-2 mb-3">
          <input
            id="referral-radiographs-enabled"
            type="checkbox"
            checked={referralTemplate.radiographs.enabled}
            onChange={(e) =>
              updateTemplate({
                ...referralTemplate,
                radiographs: { ...referralTemplate.radiographs, enabled: e.target.checked },
              })
            }
          />
          <label htmlFor="referral-radiographs-enabled" className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            Radiograph Placeholders
          </label>
        </div>

        <label className="text-xs text-gray-600 dark:text-gray-300 mb-3 block">
          Body Font Size (pt)
          <input
            type="number"
            min={8}
            step={0.5}
            value={referralTemplate.bodyFontSizePt}
            onChange={(e) =>
              updateTemplate({
                ...referralTemplate,
                bodyFontSizePt: toNumber(e.target.value, referralTemplate.bodyFontSizePt),
              })
            }
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          />
        </label>

        <div className="mb-3">
          <label className="inline-flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 cursor-pointer">
            <input
              id="referral-include-post-op"
              type="checkbox"
              checked={referralTemplate.includePostOpInstructions}
              onChange={(e) =>
                updateTemplate({
                  ...referralTemplate,
                  includePostOpInstructions: e.target.checked,
                })
              }
            />
            <span>Include post-op instructions in completion section</span>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="text-xs text-gray-600 dark:text-gray-300">
            Placement
            <select
              value={referralTemplate.radiographs.placement}
              onChange={(e) =>
                updateTemplate({
                  ...referralTemplate,
                  radiographs: { ...referralTemplate.radiographs, placement: e.target.value as typeof referralTemplate.radiographs.placement },
                })
              }
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            >
              <option value="after_completion">After Completion Section</option>
              <option value="before_comments">Before Comments</option>
              <option value="end">End of Letter</option>
            </select>
          </label>
          <label className="text-xs text-gray-600 dark:text-gray-300">
            Slots
            <input
              type="number"
              min={0}
              step={1}
              value={referralTemplate.radiographs.slots}
              onChange={(e) =>
                updateTemplate({
                  ...referralTemplate,
                  radiographs: { ...referralTemplate.radiographs, slots: Math.max(0, Math.round(toNumber(e.target.value, referralTemplate.radiographs.slots))) },
                })
              }
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            />
          </label>
          <label className="text-xs text-gray-600 dark:text-gray-300">
            Columns
            <input
              type="number"
              min={1}
              step={1}
              value={referralTemplate.radiographs.columns}
              onChange={(e) =>
                updateTemplate({
                  ...referralTemplate,
                  radiographs: { ...referralTemplate.radiographs, columns: Math.max(1, Math.round(toNumber(e.target.value, referralTemplate.radiographs.columns))) },
                })
              }
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            />
          </label>
          <label className="text-xs text-gray-600 dark:text-gray-300">
            Slot Width (in)
            <input
              type="number"
              min={0.5}
              step={0.1}
              value={referralTemplate.radiographs.slotWidthIn}
              onChange={(e) =>
                updateTemplate({
                  ...referralTemplate,
                  radiographs: { ...referralTemplate.radiographs, slotWidthIn: toNumber(e.target.value, referralTemplate.radiographs.slotWidthIn) },
                })
              }
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            />
          </label>
          <label className="text-xs text-gray-600 dark:text-gray-300">
            Slot Height (in)
            <input
              type="number"
              min={0.5}
              step={0.1}
              value={referralTemplate.radiographs.slotHeightIn}
              onChange={(e) =>
                updateTemplate({
                  ...referralTemplate,
                  radiographs: { ...referralTemplate.radiographs, slotHeightIn: toNumber(e.target.value, referralTemplate.radiographs.slotHeightIn) },
                })
              }
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            />
          </label>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="flex items-center gap-2 mb-3">
          <input
            id="referral-signature-enabled"
            type="checkbox"
            checked={referralTemplate.signature.enabled}
            onChange={(e) =>
              updateTemplate({
                ...referralTemplate,
                signature: { ...referralTemplate.signature, enabled: e.target.checked },
              })
            }
          />
          <label htmlFor="referral-signature-enabled" className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            Signature Block
          </label>
        </div>

        <textarea
          value={referralTemplate.signature.lines.join('\n')}
          onChange={(e) =>
            updateTemplate({
              ...referralTemplate,
              signature: { ...referralTemplate.signature, lines: e.target.value.split('\n') },
            })
          }
          rows={3}
          placeholder="Signature lines (one per row)"
          className="mb-3 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="text-xs text-gray-600 dark:text-gray-300">
            Signature Width (in)
            <input
              type="number"
              min={0.5}
              step={0.1}
              value={referralTemplate.signature.image?.widthIn ?? 2}
              onChange={(e) =>
                updateTemplate({
                  ...referralTemplate,
                  signature: {
                    ...referralTemplate.signature,
                    image: referralTemplate.signature.image
                      ? {
                          ...referralTemplate.signature.image,
                          widthIn: toNumber(e.target.value, 2),
                          heightIn: referralTemplate.signature.image.aspectRatio
                            ? toNumber(e.target.value, 2) / referralTemplate.signature.image.aspectRatio
                            : referralTemplate.signature.image.heightIn,
                        }
                      : { dataUrl: '', widthIn: toNumber(e.target.value, 2) },
                  },
                })
              }
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            />
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm hover:bg-gray-50 cursor-pointer dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100">
              <span>{referralTemplate.signature.image?.dataUrl ? 'Replace Signature' : 'Upload Signature'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleSignatureUpload(file);
                }}
                className="sr-only"
              />
            </label>
            {referralTemplate.signature.image?.dataUrl && (
              <button
                type="button"
                onClick={() =>
                  updateTemplate({
                    ...referralTemplate,
                    signature: { ...referralTemplate.signature, image: undefined },
                  })
                }
                className="text-xs text-red-600 hover:underline"
              >
                Remove Signature
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Document Preview</h3>
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4 overflow-x-auto">
          <div
            className="mx-auto bg-white text-gray-900 shadow-md border border-gray-300"
            style={{
              width: '8.5in',
              height: '11in',
              fontFamily: '"Times New Roman", Times, serif',
              fontSize: `${referralTemplate.bodyFontSizePt}pt`,
              lineHeight: 1.4,
            }}
          >
            <div
              className="relative h-full"
              style={{
                paddingTop: `${marginValues.top}in`,
                paddingRight: `${marginValues.right}in`,
                paddingBottom: `${marginValues.bottom}in`,
                paddingLeft: `${marginValues.left}in`,
              }}
            >
              {referralTemplate.headerBlocks.some((block) => block.enabled && (block.text.trim() || block.logo?.dataUrl)) && (
                <div className="mb-4 space-y-3">
                  {referralTemplate.headerBlocks
                    .filter((block) => block.enabled && (block.text.trim() || block.logo?.dataUrl))
                    .map((block) => renderHeaderBlock(block))}
                  <div className="border-b border-gray-300 mt-2" />
                </div>
              )}

              <div className="space-y-3">
                <div>
                  {previewBlocks.patientMeta.map((line) => (
                    <div key={`meta-${line}`}>{renderLineWithBoldLabel(line)}</div>
                  ))}
                </div>

                <div>Dear Colleague,</div>

                <div>{renderIntroParagraph()}</div>

                <div>{renderLineWithBoldLabel(previewBlocks.toothAreaLine)}</div>

                <div>
                  {previewBlocks.consultationLines.map((line, idx) => {
                    const indentSpaces = (line.match(/^(\s+)/)?.[1].length ?? 0) / 2;
                    const content = line.trim().startsWith('Consultation Date:')
                      ? renderLineWithBoldLabel(line)
                      : line.trim();
                    return (
                      <div key={`consult-${idx}`} style={{ paddingLeft: `${0.25 * indentSpaces}in` }}>
                        {content}
                      </div>
                    );
                  })}
                </div>

                {previewBlocks.completionLines.length > 0 && (
                  <div>
                    {previewBlocks.completionLines.map((line, idx) => {
                      const indentSpaces = (line.match(/^(\s+)/)?.[1].length ?? 0) / 2;
                      const content = line.trim().startsWith('Treatment Completion Date:')
                        ? renderLineWithBoldLabel(line)
                        : line.trim();
                      return (
                        <div key={`completion-${idx}`} style={{ paddingLeft: `${0.25 * indentSpaces}in` }}>
                          {content}
                        </div>
                      );
                    })}
                  </div>
                )}

                <div>
                  <div>{renderLineWithBoldLabel('Comments:')}</div>
                  <div style={{ paddingLeft: '0.25in' }}>{previewBlocks.comments}</div>
                </div>

                <div>{previewBlocks.closing}</div>

                {referralTemplate.signature.enabled && (
                  <div>
                    {referralTemplate.signature.image?.dataUrl && (
                      <img
                        src={referralTemplate.signature.image.dataUrl}
                        alt="Signature"
                        style={{
                          width: `${referralTemplate.signature.image.widthIn}in`,
                          height: referralTemplate.signature.image.heightIn
                            ? `${referralTemplate.signature.image.heightIn}in`
                            : 'auto',
                        }}
                      />
                    )}
                    <div className="whitespace-pre-line">
                      {(() => {
                        const trimmedLines = referralTemplate.signature.lines.filter((line) => line.trim() !== '');
                        const shouldPadSincerely =
                          trimmedLines.length === 1 &&
                          trimmedLines[0].trim().toLowerCase() === 'sincerely,';
                        const signatureLines = shouldPadSincerely
                          ? [...referralTemplate.signature.lines, '', '']
                          : referralTemplate.signature.lines;
                        return signatureLines.join('\n');
                      })()}
                    </div>
                  </div>
                )}

                {referralTemplate.radiographs.enabled && (
                  <div>
                    <div className="mb-2 font-semibold">Radiographs</div>
                    <div
                      className="grid gap-2"
                      style={{ gridTemplateColumns: `repeat(${radiographColumns}, minmax(0, 1fr))` }}
                    >
                      {Array.from({ length: radiographSlots }).map((_, idx) => (
                        <div
                          key={`rad-after-${idx}`}
                          className="border border-gray-400 bg-gray-100"
                          style={{
                            width: `${referralTemplate.radiographs.slotWidthIn}in`,
                            height: `${referralTemplate.radiographs.slotHeightIn}in`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {referralTemplate.footer.enabled &&
                (referralTemplate.footer.text.trim() || referralTemplate.footerImage?.dataUrl) && (
                  <div
                    className="absolute left-0 right-0 border-t border-gray-300 pt-2 text-xs text-gray-600"
                    style={{
                      bottom: `${Math.max(0, marginValues.bottom - 0.25)}in`,
                      textAlign: referralTemplate.footer.align,
                      fontSize: `${referralTemplate.footerFontSizePt}pt`,
                    }}
                  >
                    {referralTemplate.footerImage?.dataUrl &&
                      referralTemplate.footerImagePlacement === 'above_text' && (
                        <img
                          src={referralTemplate.footerImage.dataUrl}
                          alt="Footer"
                          style={{
                            width: `${referralTemplate.footerImage.widthIn}in`,
                            height: referralTemplate.footerImage.heightIn
                              ? `${referralTemplate.footerImage.heightIn}in`
                              : 'auto',
                            display: 'block',
                            marginLeft: referralTemplate.footerImage.align === 'left' ? 0 : 'auto',
                            marginRight: referralTemplate.footerImage.align === 'right' ? 0 : 'auto',
                            marginBottom: '0.15in',
                          }}
                        />
                      )}
                    {referralTemplate.footer.text.trim() && (
                      <div className="whitespace-pre-line">{referralTemplate.footer.text}</div>
                    )}
                    {referralTemplate.footerImage?.dataUrl &&
                      referralTemplate.footerImagePlacement === 'below_text' && (
                        <img
                          src={referralTemplate.footerImage.dataUrl}
                          alt="Footer"
                          style={{
                            width: `${referralTemplate.footerImage.widthIn}in`,
                            height: referralTemplate.footerImage.heightIn
                              ? `${referralTemplate.footerImage.heightIn}in`
                              : 'auto',
                            display: 'block',
                            marginLeft: referralTemplate.footerImage.align === 'left' ? 0 : 'auto',
                            marginRight: referralTemplate.footerImage.align === 'right' ? 0 : 'auto',
                            marginTop: '0.15in',
                          }}
                        />
                      )}
                  </div>
                )}
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            Preview uses page size, margins, and section ordering to match the exported Word document.
          </div>
        </div>
      </div>
    </div>
  );
}
