export default function BrandText({ size = 'normal', className = '' }) {
  const sizeClasses = {
    small: 'text-sm',
    normal: 'text-lg',
    large: 'text-2xl',
    xlarge: 'text-4xl'
  }

  return (
    <span className={`font-bold ${sizeClasses[size]} ${className}`}>
      <span className="text-white">Better</span>
      <span 
        className="bg-gradient-to-r from-amber-500 to-yellow-400 bg-clip-text text-transparent font-extrabold"
        style={{
          background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}
      >
        YOU
      </span>
    </span>
  )
}