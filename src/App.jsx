import { useEffect, useRef, useState } from 'react'
import './App.css'

function App() {
  const MAX_FILES = 5
  const [items, setItems] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef(null)
  const itemsRef = useRef(items)

  useEffect(() => {
    itemsRef.current = items
  }, [items])

  useEffect(() => {
    return () => {
      itemsRef.current.forEach((item) => URL.revokeObjectURL(item.url))
    }
  }, [])

  const createId = () =>
    (typeof crypto !== 'undefined' && crypto.randomUUID && crypto.randomUUID()) ||
    `${Date.now()}-${Math.random().toString(36).slice(2)}`

  const addFiles = (fileList) => {
    const nextFiles = Array.from(fileList || []).filter((file) =>
      file.type.startsWith('image/')
    )

    if (!nextFiles.length) {
      setError('이미지 파일만 업로드할 수 있어요.')
      return
    }

    setError('')
    setItems((prev) => {
      const available = MAX_FILES - prev.length
      if (available <= 0) {
        setError(`최대 ${MAX_FILES}장까지 업로드할 수 있어요.`)
        return prev
      }

      const slice = nextFiles.slice(0, available).map((file) => ({
        id: createId(),
        file,
        url: URL.createObjectURL(file),
      }))

      if (nextFiles.length > available) {
        setError(`최대 ${MAX_FILES}장까지 업로드할 수 있어요.`)
      }

      return [...prev, ...slice]
    })

    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setIsDragging(false)
    addFiles(event.dataTransfer.files)
  }

  const handleDragOver = (event) => {
    event.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (event) => {
    event.preventDefault()
    setIsDragging(false)
  }

  const handlePickClick = () => {
    inputRef.current?.click()
  }

  const handleRemove = (id) => {
    setItems((prev) => {
      const target = prev.find((item) => item.id === id)
      if (target) {
        URL.revokeObjectURL(target.url)
      }
      return prev.filter((item) => item.id !== id)
    })
  }

  return (
    <div className="page">
      <header className="hero">
        <div>
          <p className="eyebrow">NOKKI / 자동 누끼</p>
          <h1>이미지를 올리면 배경을 깔끔하게 분리해줘요.</h1>
          <p className="subhead">
            드래그 앤 드롭 또는 클릭으로 최대 5장의 이미지를 업로드할 수 있어요.
            서버는 준비 중이라 결과 이미지는 곧 제공됩니다.
          </p>
        </div>
        <div className="hero-meta">
          <div className="meta-card">
            <p className="meta-title">무료</p>
            <p className="meta-detail">현재 베타</p>
          </div>
          <div className="meta-card">
            <p className="meta-title">빠른 처리</p>
            <p className="meta-detail">서버 준비 중</p>
          </div>
        </div>
      </header>

      <section className="upload">
        <div
          className={`drop-zone ${isDragging ? 'is-dragging' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          role="button"
          tabIndex={0}
          onClick={handlePickClick}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              handlePickClick()
            }
          }}
        >
          <input
            ref={inputRef}
            className="file-input"
            type="file"
            accept="image/*"
            multiple
            onChange={(event) => addFiles(event.target.files)}
          />
          <div className="drop-content">
            <p className="drop-title">이미지를 놓아주세요</p>
            <p className="drop-desc">또는 클릭해서 파일 선택</p>
          </div>
          <div className="drop-status">
            <span>{items.length}</span>/<span>{MAX_FILES}</span>
          </div>
        </div>

        {error && <p className="error">{error}</p>}
      </section>

      <section className="gallery">
        {items.length === 0 ? (
          <div className="empty">
            아직 업로드된 이미지가 없어요. 샘플 이미지를 올려보세요.
          </div>
        ) : (
          <div className="grid">
            {items.map((item) => (
              <article key={item.id} className="card">
                <img src={item.url} alt={item.file.name} />
                <div className="card-footer">
                  <div>
                    <p className="file-name">{item.file.name}</p>
                    <p className="file-status">처리 대기</p>
                  </div>
                  <button
                    type="button"
                    className="remove"
                    onClick={() => handleRemove(item.id)}
                  >
                    삭제
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default App
