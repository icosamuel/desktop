import { git } from './core'
import { Repository } from '../../models/repository'
import { SubmoduleEntry } from '../../models/submodule'

export async function listActiveSubmodules(
  repository: Repository
): Promise<ReadonlyArray<SubmoduleEntry>> {
  return listSubmodules(repository).then(list =>
    list.filter(submodule => {
      return submodule.describe
    })
  )
}

export async function listSubmodules(
  repository: Repository
): Promise<ReadonlyArray<SubmoduleEntry>> {
  // We don't recurse when listing submodules here because we don't have a good
  // story about managing these currently. So for now we're only listing
  // changes to the top-level submodules to be consistent with `git status`
  const result = await git(
    ['submodule', 'status', '--'],
    repository.path,
    'listSubmodules',
    {
      successExitCodes: new Set([0, 128]),
    }
  )

  if (result.exitCode === 128) {
    // unable to parse submodules in repository, giving up
    return []
  }

  const submodules = new Array<SubmoduleEntry>()

  for (const entry of result.stdout.split('\n')) {
    if (entry.length === 0) {
      continue
    }

    // entries are of the format:
    //  1eaabe34fc6f486367a176207420378f587d3b48 git (v2.16.0-rc0)
    //
    // first character:
    //   - " " if no change
    //   - "-" if the submodule is not initialized
    //   - "+" if the currently checked out submodule commit does not match the SHA-1 found in the index of the containing repository
    //   - "U" if the submodule has merge conflicts
    const state = entry.substr(0, 1)

    //
    // then the 40-character SHA represents the current commit
    const sha = entry.substr(1, 40)

    //
    // then the path to the submodule
    //
    // then the output of `git describe` for the submodule in braces
    // we're not leveraging this in the app, so go and read the docs
    // about it if you want to learn more:
    //
    // https://git-scm.com/docs/git-describe

    const [path, describeOutput] = entry.substr(42).split(/\s+/)

    // if the submodule has not been initialized, no describe output is set
    // this means we don't have a submodule to work with
    const describe = describeOutput
      ? describeOutput.substr(1, describeOutput.length - 2)
      : ''
    submodules.push(new SubmoduleEntry(sha, path, describe, state))
  }

  return submodules
}

export async function forceUpdateSubmodule(
  repository: Repository,
  submodule: SubmoduleEntry
): Promise<void> {
  await git(
    ['submodule', 'update', '--recursive', '--force', '--', submodule.path],
    repository.path,
    'forceUpdateSubmodule'
  )
}

export async function updateSubmodules(repository: Repository): Promise<void> {
  await git(
    ['submodule', 'update', '--recursive', '--all'],
    repository.path,
    'updateSubmodules'
  )
}

export async function updateSubmodule(
  repository: Repository,
  submodule: SubmoduleEntry
): Promise<void> {
  await git(
    ['submodule', 'update', '--recursive', '--', submodule.path],
    repository.path,
    'updateSubmodule'
  )
}

export async function initSubmodules(repository: Repository): Promise<void> {
  await git(['submodule', 'init', '--all'], repository.path, 'initSubmodules')
}

export async function initSubmodule(
  repository: Repository,
  submodule: SubmoduleEntry
): Promise<void> {
  await git(
    ['submodule', 'init', '--', submodule.path],
    repository.path,
    'initSubmodule'
  )
}

export async function resetSubmodulePaths(
  repository: Repository,
  paths: ReadonlyArray<string>
): Promise<void> {
  for (const path of paths) {
    await git(
      ['submodule', 'update', '--recursive', '--', path],
      repository.path,
      'updateSubmodule'
    )
  }
}
