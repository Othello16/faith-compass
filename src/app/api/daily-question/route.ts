import { NextResponse } from 'next/server'

const QUESTIONS = [
  "What does the Bible say about finding peace in the middle of anxiety?",
  "How should I handle anger toward someone who hurt me?",
  "What does God's Word say about my purpose and calling?",
  "How does Scripture guide us through grief and loss?",
  "What does the Bible say about trusting God when life feels uncertain?",
  "How should a believer respond to betrayal?",
  "What does the Word say about financial stewardship and debt?",
  "How does the Bible define true love in marriage?",
  "What does Scripture say about raising children in faith?",
  "How do I forgive someone who hasn't asked for forgiveness?",
  "What does the Bible say about dealing with loneliness?",
  "How should I pray when I don't know what to say?",
  "What does Scripture say about standing firm against temptation?",
  "How does God view those who are broken and struggling?",
  "What does the Bible say about fear and how to overcome it?",
  "How should a Christian handle doubt about their faith?",
  "What does Scripture say about generosity and giving?",
  "How does the Bible describe the armor of God and spiritual warfare?",
  "What does God's Word say about healing — physically and spiritually?",
  "How should we treat those who are different from us?",
  "What does the Bible say about the Holy Spirit's role in daily life?",
  "How does Scripture speak to addiction and breaking strongholds?",
  "What does the Word say about perseverance through suffering?",
  "How does the Bible define wisdom and how do we get it?",
  "What does Scripture say about identity — who am I in Christ?",
  "How should believers navigate political division and cultural conflict?",
  "What does the Bible say about sexual purity and holiness?",
  "How do I know if a decision aligns with God's will?",
  "What does Scripture say about the power of our words?",
  "How does the Bible speak to depression and hopelessness?",
]

export async function GET() {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  )
  const question = QUESTIONS[dayOfYear % QUESTIONS.length]
  return NextResponse.json({ question, index: dayOfYear % QUESTIONS.length })
}
