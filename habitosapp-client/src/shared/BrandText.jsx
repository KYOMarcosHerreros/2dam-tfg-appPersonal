export default function BrandText({ size = 'normal', className = '' }) {
  const sizeStyles = {
    small: { fontSize: '14px' },
    normal: { fontSize: '18px' },
    large: { fontSize: '24px' },
    xlarge: { fontSize: '32px' }
  }

  return (
    <span 
      className={className}
      style={{ 
        fontWeight: 'bold',
        ...sizeStyles[size]
      }}
    >
      <span style={{ color: 'white' }}>Better</span>
      <span 
        style={{
          background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          fontWeight: '800'
        }}
      >
        YOU
      </span>
    </span>
  )
}