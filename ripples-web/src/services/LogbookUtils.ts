import { request } from './RequestUtils'
import MyLogbook from '../model/MyLogbook';

const apiURL = process.env.REACT_APP_API_BASE_URL

export default class LogbookService {
  public async fetchLogbooksInfo() {
    return request({
      url: `${apiURL}/logbooks`,
    })
  }

  public async addLogbook(logbook: MyLogbook) {
    return request({
      method: 'POST',
      body: JSON.stringify(logbook),
      url: `${apiURL}/logbooks`,
    })
  }

  public async addAnnotation(logbookName: string, annotationData: string) {
    return request({
      method: 'POST',
      body: JSON.stringify(annotationData),
      url: `${apiURL}/logbooks/${logbookName}`,
    })
  }

  public async deleteLogbook(logbookName: string) {
    return request({
      method: 'DELETE',
      url: `${apiURL}/logbooks/${logbookName}`,
    })
  }

  public async deleteAnnotation(logbookName: string, annotationId: number) {
    return request({
      method: 'DELETE',
      url: `${apiURL}/logbooks/${logbookName}/${annotationId}`,
    })
  }
}