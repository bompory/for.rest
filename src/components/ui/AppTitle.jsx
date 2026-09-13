/** 앱 이름 "조회조회" — 아침 조회(朝會)와 마음을 조회(照會)한다는 두 뜻을 한자로 같이 보여준다. */
export default function AppTitle({ size = 'text-2xl', className = '' }) {
  return (
    <h1 className={`font-round font-bold text-ink ${size} ${className}`}>
      조회
      <span className="text-[0.5em] font-normal text-ink/50 align-top">(朝會)</span>
      조회
      <span className="text-[0.5em] font-normal text-ink/50 align-top">(照會)</span>
    </h1>
  )
}
