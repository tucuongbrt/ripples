import { Annotation, INewAnnotation } from '../model/IAnnotations'
import MyLogbook from '../model/MyLogbook'
import { request } from './RequestUtils'

const apiURL = process.env.REACT_APP_API_BASE_URL

export default class LogbookService {
  public async fetchLogbooksInfo() {
    return request({
      url: `${apiURL}/logbooks`,
    })
  }

  public async fetchLogbook(logbookName: string = 'default') {
    return request({
      url: `${apiURL}/logbooks/${logbookName}`,
    })
  }

  public async fetchLastAnnotation(logbookName: string = 'default') {
    return request({
      url: `${apiURL}/logbooks/${logbookName}/annotations`,
    })
  }

  public async addLogbook(logbook: MyLogbook) {
    return request({
      method: 'POST',
      body: JSON.stringify(logbook),
      url: `${apiURL}/logbooks`,
    })
  }

  public async deleteLogbook(logbookName: string) {
    return request({
      method: 'DELETE',
      url: `${apiURL}/logbooks/${logbookName}`,
    })
  }

  public async editAnnotation(annotationData: Annotation, logbookName: string = 'default') {
    return request({
      method: 'POST',
      body: JSON.stringify(annotationData),
      url: `${apiURL}/logbooks/${logbookName}/edit`,
    })
  }

  public async addAnnotation(annotationData: INewAnnotation, logbookName: string = 'default') {
    return request({
      method: 'POST',
      body: JSON.stringify(annotationData),
      url: `${apiURL}/logbooks/${logbookName}`,
    })
  }

  public async deleteAnnotation(annotationId: number, logbookName: string = 'default') {
    return request({
      method: 'DELETE',
      url: `${apiURL}/logbooks/${logbookName}/${annotationId}`,
    })
  }
}
