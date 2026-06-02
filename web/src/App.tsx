import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { toBlob } from 'html-to-image'
import {
  bundledLanguagesInfo,
  bundledThemesInfo,
  codeToHtml,
  type BundledLanguage,
  type BundledTheme,
} from 'shiki'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ColorPicker } from '@/components/ui/color-picker'
import { Slider } from '@/components/ui/slider'
import { ClipboardIcon, DownloadIcon } from 'lucide-react'
import './App.css'

type SelectOption = {
  value: string
  label: string
  description?: string
}

type FontOption = SelectOption & {
  family: string
}

const DEFAULT_CODE = `type HighlightRequest = {
  language: 'typescript'
  theme: 'github-dark'
  code: string
}

export async function highlight(request: HighlightRequest) {
  const response = await fetch('/api/highlight', {
    method: 'POST',
    body: JSON.stringify(request),
  })

  return response.json()
}`

const DEFAULT_EXPORT_WIDTH = 3840
const DEFAULT_EXPORT_HEIGHT = 2160
const DEFAULT_EXPORT_PADDING = 0
const DEFAULT_EXPORT_FONT_SIZE = 96
const DEFAULT_EXPORT_FONT = 'ibm-plex-mono'
const DEFAULT_PREVIEW_BACKGROUND = true
const DEFAULT_PREVIEW_BACKGROUND_COLOR = '#f4f4f5'
const DEFAULT_PREVIEW_BOUNDING_BOX = true
const DEFAULT_PREVIEW_FIT = true
const PREVIEW_FIT_MARGIN = 32

const languageOptions = [...bundledLanguagesInfo]
  .map((language): SelectOption => ({
    value: language.id,
    label: language.name,
  }))
  .sort((a, b) => a.label.localeCompare(b.label))

const themeOptions = [...bundledThemesInfo]
  .map((theme): SelectOption => ({
    value: theme.id,
    label: theme.displayName,
    description: theme.type,
  }))
  .sort((a, b) => a.label.localeCompare(b.label))

const fontOptions: FontOption[] = [
  {
    value: 'ibm-plex-mono',
    label: 'IBM Plex Mono',
    description: 'mono',
    family:
      '"IBM Plex Mono", "SFMono-Regular", "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
  },
  {
    value: 'inconsolata',
    label: 'Inconsolata',
    description: 'mono',
    family:
      '"Inconsolata", "SFMono-Regular", "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
  },
]

function ShikiCombobox({
  label,
  options,
  value,
  onValueChange,
}: {
  label: string
  options: SelectOption[]
  value: string
  onValueChange: (value: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const selected = options.find((option) => option.value === value) ?? null
  const filteredOptions = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return options

    return options.filter((option) =>
      [option.label, option.value, option.description]
        .filter(Boolean)
        .some((part) => part!.toLowerCase().includes(query)),
    )
  }, [options, search])

  return (
    <label className="control">
      <span>{label}</span>
      <Combobox<SelectOption>
        items={filteredOptions}
        open={open}
        inputValue={open ? search : selected?.label}
        value={selected}
        onInputValueChange={(nextValue) => setSearch(nextValue)}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen)
          setSearch('')
        }}
        onValueChange={(option) => {
          if (option) {
            onValueChange(option.value)
            setOpen(false)
          }
        }}
        itemToStringLabel={(option) => option.label}
        itemToStringValue={(option) => option.value}
      >
        <ComboboxInput
          aria-label={label}
          className="w-full"
          placeholder={`Search ${label.toLowerCase()}`}
        />
        <ComboboxContent>
          <ComboboxEmpty>No matches</ComboboxEmpty>
          <ComboboxList>
            {filteredOptions.map((option, index) => (
              <ComboboxItem key={option.value} value={option} index={index}>
                <span className="option-label">{option.label}</span>
                {option.description ? (
                  <span className="option-meta">{option.description}</span>
                ) : null}
              </ComboboxItem>
            ))}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </label>
  )
}

function ExportSlider({
  label,
  value,
  min,
  max,
  step,
  suffix = 'px',
  onValueChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  suffix?: string
  onValueChange: (value: number) => void
}) {
  return (
    <label className="slider-control">
      <span>{label}</span>
      <strong>
        {value.toLocaleString()}
        {suffix}
      </strong>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(nextValue) => {
          const firstValue = Array.isArray(nextValue) ? nextValue[0] : nextValue
          if (typeof firstValue === 'number') onValueChange(firstValue)
        }}
      />
    </label>
  )
}

function PreviewToggle({
  id,
  label,
  checked,
  onCheckedChange,
}: {
  id: string
  label: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <div className="preview-toggle-control">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
      <label htmlFor={id}>{label}</label>
    </div>
  )
}

function App() {
  const [code, setCode] = useState(DEFAULT_CODE)
  const [language, setLanguage] = useState<BundledLanguage>('typescript')
  const [theme, setTheme] = useState<BundledTheme>('github-dark')
  const [html, setHtml] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [actionStatus, setActionStatus] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const [exportWidth, setExportWidth] = useState(DEFAULT_EXPORT_WIDTH)
  const [exportHeight, setExportHeight] = useState(DEFAULT_EXPORT_HEIGHT)
  const [exportPadding, setExportPadding] = useState(DEFAULT_EXPORT_PADDING)
  const [exportFontSize, setExportFontSize] = useState(
    DEFAULT_EXPORT_FONT_SIZE,
  )
  const [exportFont, setExportFont] = useState(DEFAULT_EXPORT_FONT)
  const [previewBackground, setPreviewBackground] = useState(
    DEFAULT_PREVIEW_BACKGROUND,
  )
  const [previewBackgroundColor, setPreviewBackgroundColor] = useState(
    DEFAULT_PREVIEW_BACKGROUND_COLOR,
  )
  const [previewBoundingBox, setPreviewBoundingBox] = useState(
    DEFAULT_PREVIEW_BOUNDING_BOX,
  )
  const [fitPreview, setFitPreview] = useState(DEFAULT_PREVIEW_FIT)
  const [previewZoom, setPreviewZoom] = useState(1)
  const previewRef = useRef<HTMLDivElement | null>(null)
  const exportSurfaceRef = useRef<HTMLDivElement | null>(null)

  const selectedTheme = useMemo(
    () => bundledThemesInfo.find((item) => item.id === theme),
    [theme],
  )
  const editorTheme = selectedTheme?.type === 'light' ? 'light' : 'dark'
  const selectedFont =
    fontOptions.find((option) => option.value === exportFont) ?? fontOptions[0]

  useEffect(() => {
    let cancelled = false

    codeToHtml(code || ' ', {
      lang: language,
      theme,
    })
      .then((nextHtml) => {
        if (cancelled) return
        setHtml(nextHtml)
        setError(null)
      })
      .catch((error: unknown) => {
        if (cancelled) return
        setError(error instanceof Error ? error.message : 'Highlight failed')
      })

    return () => {
      cancelled = true
    }
  }, [code, language, theme])

  useEffect(() => {
    if (!fitPreview) return

    const previewNode = previewRef.current
    if (!previewNode) return

    const updatePreviewZoom = () => {
      const { width, height } = previewNode.getBoundingClientRect()
      const availableWidth = Math.max(width - PREVIEW_FIT_MARGIN * 2, 1)
      const availableHeight = Math.max(height - PREVIEW_FIT_MARGIN * 2, 1)
      const nextZoom = Math.max(
        0.05,
        Math.min(1, availableWidth / exportWidth, availableHeight / exportHeight),
      )
      const roundedZoom = Math.round(nextZoom * 10000) / 10000

      setPreviewZoom((currentZoom) =>
        currentZoom === roundedZoom ? currentZoom : roundedZoom,
      )
    }

    updatePreviewZoom()

    const resizeObserver = new ResizeObserver(updatePreviewZoom)
    resizeObserver.observe(previewNode)

    return () => resizeObserver.disconnect()
  }, [exportHeight, exportWidth, fitPreview])

  const handleCodeChange = (nextCode: string) => {
    setActionStatus(null)
    setCode(nextCode)
  }

  const handleLanguageChange = (nextValue: string) => {
    setActionStatus(null)
    setLanguage(nextValue as BundledLanguage)
  }

  const handleThemeChange = (nextValue: string) => {
    setActionStatus(null)
    setTheme(nextValue as BundledTheme)
  }

  const handleFontChange = (nextValue: string) => {
    setActionStatus(null)
    setExportFont(nextValue)
  }

  const handleExportSettingChange =
    (setter: (value: number) => void) => (nextValue: number) => {
      setActionStatus(null)
      setter(nextValue)
    }

  const handlePreviewBackgroundChange = (checked: boolean) => {
    setActionStatus(null)
    setPreviewBackground(checked)
  }

  const handlePreviewBackgroundColorChange = (nextValue: string) => {
    setActionStatus(null)
    setPreviewBackgroundColor(nextValue)
  }

  const handlePreviewBoundingBoxChange = (checked: boolean) => {
    setActionStatus(null)
    setPreviewBoundingBox(checked)
  }

  const handleFitPreviewChange = (checked: boolean) => {
    setActionStatus(null)
    setFitPreview(checked)
  }

  const createPngBlob = async () => {
    if (!exportSurfaceRef.current) {
      throw new Error('Preview surface is not ready')
    }

    await document.fonts?.load(`${exportFontSize}px "${selectedFont.label}"`)
    await document.fonts?.ready

    const blob = await toBlob(exportSurfaceRef.current, {
      cacheBust: true,
      pixelRatio: 1,
      width: exportWidth,
      height: exportHeight,
      canvasWidth: exportWidth,
      canvasHeight: exportHeight,
      backgroundColor: 'transparent',
      style: {
        width: `${exportWidth}px`,
        height: `${exportHeight}px`,
        background: 'transparent',
        fontSize: `${exportFontSize}px`,
        fontFamily: selectedFont.family,
      },
    })

    if (!blob) throw new Error('PNG export failed')
    return blob
  }

  const handleDownload = async () => {
    try {
      setExporting(true)
      const blob = await createPngBlob()
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `syntax-highlight-${exportWidth}x${exportHeight}.png`
      anchor.click()
      URL.revokeObjectURL(url)
      setActionStatus('Downloaded PNG')
    } catch (error) {
      setActionStatus(null)
      setError(error instanceof Error ? error.message : 'Download failed')
    } finally {
      setExporting(false)
    }
  }

  const handleCopy = async () => {
    try {
      if (typeof ClipboardItem === 'undefined') {
        throw new Error('PNG clipboard copy is not supported in this browser')
      }
      setExporting(true)
      const blob = await createPngBlob()
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob,
        }),
      ])
      setActionStatus('Copied PNG')
    } catch (error) {
      setActionStatus(null)
      setError(
        error instanceof Error ? error.message : 'Copy to clipboard failed',
      )
    } finally {
      setExporting(false)
    }
  }

  const exportSurfaceStyle = {
    width: `${exportWidth}px`,
    height: `${exportHeight}px`,
    padding: `${exportPadding}px`,
    fontSize: `${exportFontSize}px`,
    fontFamily: selectedFont.family,
  }
  const previewScale = fitPreview ? previewZoom : 1
  const previewStageStyle = {
    width: `${exportWidth * previewScale}px`,
    height: `${exportHeight * previewScale}px`,
  }
  const previewScaleStyle = {
    width: `${exportWidth}px`,
    height: `${exportHeight}px`,
    transform: `scale(${previewScale})`,
  }
  const previewStyle = {
    '--preview-background-color': previewBackgroundColor,
  } as CSSProperties

  return (
    <main className="workspace">
      <header className="toolbar">
        <div>
          <h1>Wendy Syntax Highlighter</h1>
          <p>{error ?? actionStatus ?? 'Ready'}</p>
        </div>
        <div className="controls">
          <ShikiCombobox
            label="Language"
            options={languageOptions}
            value={language}
            onValueChange={handleLanguageChange}
          />
          <ShikiCombobox
            label="Theme"
            options={themeOptions}
            value={theme}
            onValueChange={handleThemeChange}
          />
        </div>
      </header>

      <section className="panes">
        <div className="pane">
          <div className="pane-heading">
            <h2>Code</h2>
          </div>
          <CodeMirror
            value={code}
            height="100%"
            theme={editorTheme}
            basicSetup={{
              lineNumbers: true,
              foldGutter: true,
              highlightActiveLine: true,
              highlightSelectionMatches: true,
            }}
            onChange={handleCodeChange}
          />
        </div>

        <div className="pane preview-pane">
          <div className="preview-tools">
            <div className="preview-tools-heading">
              <h2>Preview</h2>
              <span>
                {exportWidth.toLocaleString()} x{' '}
                {exportHeight.toLocaleString()}, {exportFontSize}px text,{' '}
                {Math.round(previewScale * 100)}% preview
              </span>
            </div>
            <div className="pane-actions">
              <PreviewToggle
                id="preview-background"
                label="Preview Background"
                checked={previewBackground}
                onCheckedChange={handlePreviewBackgroundChange}
              />
              <PreviewToggle
                id="preview-bounding-box"
                label="Bounding Box"
                checked={previewBoundingBox}
                onCheckedChange={handlePreviewBoundingBoxChange}
              />
              <PreviewToggle
                id="preview-fit"
                label="Fit Preview"
                checked={fitPreview}
                onCheckedChange={handleFitPreviewChange}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleDownload}
                disabled={exporting}
              >
                <DownloadIcon data-icon="inline-start" />
                Download
              </Button>
              <Button type="button" onClick={handleCopy} disabled={exporting}>
                <ClipboardIcon data-icon="inline-start" />
                Copy to Clipboard
              </Button>
            </div>
            <div className="export-controls">
              <div className="font-control">
                <ShikiCombobox
                  label="Font"
                  options={fontOptions}
                  value={exportFont}
                  onValueChange={handleFontChange}
                />
              </div>
              <label className="control background-color-control">
                <span>Background</span>
                <ColorPicker
                  disabled={!previewBackground}
                  label="Preview background color"
                  value={previewBackgroundColor}
                  onValueChange={handlePreviewBackgroundColorChange}
                />
              </label>
              <ExportSlider
                label="Width"
                value={exportWidth}
                min={1280}
                max={7680}
                step={160}
                onValueChange={handleExportSettingChange(setExportWidth)}
              />
              <ExportSlider
                label="Height"
                value={exportHeight}
                min={720}
                max={4320}
                step={90}
                onValueChange={handleExportSettingChange(setExportHeight)}
              />
              <ExportSlider
                label="Padding"
                value={exportPadding}
                min={0}
                max={512}
                step={8}
                onValueChange={handleExportSettingChange(setExportPadding)}
              />
              <ExportSlider
                label="Text"
                value={exportFontSize}
                min={24}
                max={220}
                step={4}
                onValueChange={handleExportSettingChange(setExportFontSize)}
              />
            </div>
          </div>
          <div
            ref={previewRef}
            style={previewStyle}
            className={
              [
                'preview',
                previewBackground ? 'preview-background' : '',
                fitPreview ? 'preview-fit' : '',
              ]
                .filter(Boolean)
                .join(' ')
            }
          >
            <div className="preview-stage" style={previewStageStyle}>
              <div
                className={
                  previewBoundingBox
                    ? 'preview-scale preview-scale-bounded'
                    : 'preview-scale'
                }
                style={previewScaleStyle}
              >
                <div
                  ref={exportSurfaceRef}
                  className="export-surface"
                  style={exportSurfaceStyle}
                >
                  <div
                    className="highlight-output"
                    dangerouslySetInnerHTML={{ __html: html }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default App
