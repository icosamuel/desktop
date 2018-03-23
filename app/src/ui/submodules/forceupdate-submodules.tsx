import * as React from 'react'
import { Repository } from '../../models/repository'
import { Button } from '../lib/button'
import { ButtonGroup } from '../lib/button-group'
import { Dialog, DialogContent, DialogFooter } from '../dialog'
import { Monospaced } from '../lib/monospaced'
import { PathText } from '../lib/path-text'
import { LinkButton } from '../lib/link-button'
import { SubmoduleEntry } from '../../models/submodule'

const SUBM_URL = 'https://git-scm.com/book/en/v2/Git-Tools-Submodules'

interface IForceUpdateSubmodulesProps {
  /** The repository in which submodules needs to be force updated. */
  readonly repository: Repository

  readonly submodules: ReadonlyArray<SubmoduleEntry>
  /**
   * Event triggered when the dialog is dismissed by the user in the
   * ways described in the Dialog component's dismissable prop.
   */
  readonly onDismissed: () => void

  /**
   * Called when the user chooses to initialize LFS in the repositories.
   */
  readonly onForceUpdate: (
    repository: Repository,
    submodules: ReadonlyArray<SubmoduleEntry>
  ) => void
}

export class ForceUpdateSubmodules extends React.Component<
  IForceUpdateSubmodulesProps,
  {}
> {
  public render() {
    return (
      <Dialog
        id="forceupdate-submodules"
        title="Force Update Git Submodules"
        onDismissed={this.props.onDismissed}
        onSubmit={this.onAccept}
      >
        <DialogContent>{this.renderRepositories()}</DialogContent>

        <DialogFooter>
          <ButtonGroup>
            <Button type="submit">Discard changes</Button>
            <Button onClick={this.props.onDismissed}>
              {__DARWIN__ ? 'Not Now' : 'Not now'}
            </Button>
          </ButtonGroup>
        </DialogFooter>
      </Dialog>
    )
  }

  private onAccept = () => {
    this.props.onForceUpdate(this.props.repository, this.props.submodules)
  }

  private renderRepositories() {
    return (
      <div>
        <p>
          {this.props.submodules.length} Submodules repositories have merge
          conflicts
          <LinkButton uri={SUBM_URL}>Git Submodules</LinkButton>. To continue
          with the update, Git has to discard all changes to these submodules.
          If you have worked in those submodules, do not go forward with the
          update, and go manually commit/merge your work.
        </p>
        <ul>
          {this.props.submodules.map(r => (
            <li key={r.describe}>
              <Monospaced>
                <PathText path={r.path} />
              </Monospaced>
            </li>
          ))}
        </ul>
      </div>
    )
  }
}
