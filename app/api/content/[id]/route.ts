import { NextRequest, NextResponse } from 'next/server'
import { updateContent, deleteContent } from '@/lib/server-storage'

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const contentId = params.id
    const updatedContent = await request.json()
    
    const result = await updateContent(contentId, updatedContent)
    
    if (!result) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 })
    }
    
    return NextResponse.json({ 
      message: 'Content updated successfully', 
      content: result 
    })
  } catch (error) {
    console.error('Error updating content:', error)
    return NextResponse.json({ error: 'Failed to update content' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const contentId = params.id
    const updateData = await request.json()
    
    const result = await updateContent(contentId, updateData)
    
    if (!result) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 })
    }
    
    return NextResponse.json({ 
      message: 'Content updated successfully', 
      content: result 
    })
  } catch (error) {
    console.error('Error updating content:', error)
    return NextResponse.json({ error: 'Failed to update content' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const contentId = params.id
    
    const result = await deleteContent(contentId)
    
    if (!result) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 })
    }
    
    return NextResponse.json({ 
      message: 'Content deleted successfully', 
      content: result 
    })
  } catch (error) {
    console.error('Error deleting content:', error)
    return NextResponse.json({ error: 'Failed to delete content' }, { status: 500 })
  }
}
