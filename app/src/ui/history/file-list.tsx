import * as React from 'react'
import { FileChange, mapStatus, iconForStatus } from '../../models/status'
import { showContextualMenu } from '../main-process-proxy'
import { IMenuItem } from '../../lib/menu-item'
import { PathLabel } from '../lib/path-label'
import { Octicon } from '../octicons'
import { List } from '../lib/list'

interface IFileListProps {
  readonly files: ReadonlyArray<FileChange>
  readonly selectedFile: FileChange | null
  readonly onRevertFile: () => void
  readonly onSelectedFileChanged: (file: FileChange) => void
  readonly availableWidth: number
}

export class FileList extends React.Component<IFileListProps, {}> {
  private onSelectionChanged = (row: number) => {
    const file = this.props.files[row]
    this.props.onSelectedFileChanged(file)
  }

  private renderFile = (row: number) => {
    const file = this.props.files[row]
    const status = file.status
    const fileStatus = mapStatus(status)

    const listItemPadding = 10 * 2
    const statusWidth = 16
    const filePathPadding = 5
    const availablePathWidth =
      this.props.availableWidth -
      listItemPadding -
      filePathPadding -
      statusWidth

    return (
      <div className="file" onContextMenu={this.onContextMenu}>
        <PathLabel
          path={file.path}
          oldPath={file.oldPath}
          status={file.status}
          availableWidth={availablePathWidth}
        />

        <Octicon
          symbol={iconForStatus(status)}
          className={'status status-' + fileStatus.toLowerCase()}
          title={fileStatus}
        />
      </div>
    )
  }

  private onContextMenu = (event: React.MouseEvent<any>) => {
    event.preventDefault()

    const items: IMenuItem[] = [
      {
        label: __DARWIN__
          ? 'Revert This File To Previous Commit'
          : 'Revert this file to previous commit',
        action: this.props.onRevertFile,
      },
    ]

    showContextualMenu(items)
  }

  private rowForFile(file: FileChange | null): number {
    return file ? this.props.files.findIndex(f => f.path === file.path) : -1
  }

  public render() {
    return (
      <div className="file-list">
        <List
          rowRenderer={this.renderFile}
          rowCount={this.props.files.length}
          rowHeight={29}
          selectedRow={this.rowForFile(this.props.selectedFile)}
          onSelectionChanged={this.onSelectionChanged}
        />
      </div>
    )
  }
}
