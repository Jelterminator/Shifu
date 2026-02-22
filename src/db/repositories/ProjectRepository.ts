import type { Project, ProjectRow } from '../../types/database';
import { generateId } from '../../utils/id';
import { db } from '../database';
import { mapProjectRowToProject, safeStringify } from '../mappers';
import { vectorService } from '../vectors';

class ProjectRepository {
  // CREATE
  async create(
    userId: string,
    data: Omit<
      Project,
      'id' | 'userId' | 'createdAt' | 'updatedAt' | 'isCompleted' | 'linkedObjectIds'
    > & {
      linkedObjectIds?: string[];
    }
  ): Promise<Project> {
    const id = generateId();
    const selectedKeywordsJson = safeStringify(data.selectedKeywords || []);
    const linkedObjectIdsJson = safeStringify(data.linkedObjectIds || []);

    await db.execute(
      `INSERT INTO projects (
        id, user_id, title, deadline, notes, is_completed, selected_keywords, linked_object_ids
      ) VALUES (?, ?, ?, ?, ?, 0, ?, ?)`,
      [
        id,
        userId,
        data.title,
        data.deadline ? data.deadline.toISOString() : null,
        data.notes || null,
        selectedKeywordsJson,
        linkedObjectIdsJson,
      ]
    );

    const rows = await db.query<ProjectRow>('SELECT * FROM projects WHERE id = ?', [id]);
    const firstRow = rows[0];
    if (!firstRow) throw new Error('Failed to create project: Row not found');
    const project = mapProjectRowToProject(firstRow);

    const embedText = [project.title, project.notes].filter(Boolean).join(' ');
    try {
      await vectorService.addEmbedding(userId, 'project', id, embedText);
    } catch (e) {
      console.warn('Failed to add embedding for project', e);
    }

    return project;
  }

  // READ
  async getById(id: string): Promise<Project | null> {
    const rows = await db.query<ProjectRow>('SELECT * FROM projects WHERE id = ?', [id]);
    return rows[0] ? mapProjectRowToProject(rows[0]) : null;
  }

  async getAllForUser(userId: string, completed = false): Promise<Project[]> {
    const rows = await db.query<ProjectRow>(
      'SELECT * FROM projects WHERE user_id = ? AND is_completed = ? ORDER BY created_at DESC',
      [userId, completed ? 1 : 0]
    );
    return rows.map(mapProjectRowToProject);
  }

  async getProjectsByKeyword(userId: string, keyword: string): Promise<Project[]> {
    const rows = await db.query<ProjectRow>(
      `SELECT * FROM projects 
       WHERE user_id = ? 
         AND is_completed = 0
         AND selected_keywords LIKE ?`,
      [userId, `%"${keyword}"%`]
    );
    return rows.map(mapProjectRowToProject);
  }

  // UPDATE
  async update(id: string, data: Partial<Project>): Promise<void> {
    const updates: string[] = [];
    const params: (string | number | null)[] = [];

    if (data.title !== undefined) {
      updates.push('title = ?');
      params.push(data.title);
    }
    if (data.deadline !== undefined) {
      updates.push('deadline = ?');
      params.push(data.deadline ? data.deadline.toISOString() : null);
    }
    if (data.notes !== undefined) {
      updates.push('notes = ?');
      params.push(data.notes || null);
    }
    if (data.isCompleted !== undefined) {
      updates.push('is_completed = ?');
      params.push(data.isCompleted ? 1 : 0);
      if (data.isCompleted) {
        updates.push("completed_at = datetime('now')");
      } else {
        updates.push('completed_at = NULL');
      }
    }
    if (data.selectedKeywords !== undefined) {
      updates.push('selected_keywords = ?');
      params.push(safeStringify(data.selectedKeywords));
    }

    if (updates.length === 0) return;

    updates.push("updated_at = datetime('now')");
    params.push(id);

    await db.execute(`UPDATE projects SET ${updates.join(', ')} WHERE id = ?`, params);

    if (data.title !== undefined || data.notes !== undefined) {
      try {
        const project = await this.getById(id);
        if (project) {
          const embedText = [project.title, project.notes].filter(Boolean).join(' ');
          await vectorService.addEmbedding(project.userId, 'project', id, embedText);
        }
      } catch (e) {
        console.warn('Failed to update embedding for project', e);
      }
    }
  }

  // DELETE
  async delete(id: string): Promise<void> {
    await db.execute('DELETE FROM projects WHERE id = ?', [id]);
    try {
      await vectorService.delete('project', id);
    } catch (e) {
      console.warn('Failed to delete embedding for project', e);
    }
  }
}

export const projectRepository = new ProjectRepository();
