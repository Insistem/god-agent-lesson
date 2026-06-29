import { tool } from '@langchain/core/tools'
import fs from 'node:fs/promises'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { file, z } from 'zod'

// 1. 读取文件工具
const readFileTool = tool(
    async ({filePath}) => {
        try {
            const content = await fs.readFile(filePath, 'utf-8')
            console.log(`[工具调用] read_file("${filePath}") - 成功读取 ${content.length} 字节`)
            return `文件内容：\n${content}`
        } catch (error) {
            console.error(`[工具调用] read_file(${filePath}) - 失败：${error.message}`)
            return `读取文件失败：${error.message}`
        }
    },
    {
        name: 'read_file',
        description: '读取指定路径的文件内容',
        schema: z.object({
            filePath: z.string().describe('文件路径')
        })

    }
)

// 2. 写入文件工具
const writeFileTool = tool(
    async ({filePath, content}) => {
        try {
            const dir = path.dirname(filePath)
            await fs.mkdir(dir, {recursive: true})
            await fs.writeFile(filePath, content, 'utf-8')
            console.log(`[工具调用] write_file("${filePath}") - 成功写入 ${content.length} 字节`)
            return `写入文件成功： ${filePath}`
        } catch (error) {
            schema: z.object({
            filePath: z.string().describe('文件路径')
        })
        }
    },
    {
        name: 'write_file',
        description: '向指定路径写入文件内容，自动创建目录',
        schema: z.object({
            filePath: z.string().describe('文件路径'),
            content: z.string().describe('文件内容')
        })
    }
)

// 3.执行命令工具（带实时输出）
const executeCommandTool = tool(
    async ({command, workingDir}) => {
        const cwd = workingDir || process.cwd()
        console.log(`[工具调用] execute_command("${command}") - 开始执行，工作目录：${cwd}`)
        return new Promise((resolve, reject) => {
            const [cmd, ...args] = command.split(' ')
            const child = spawn(cmd, args, { cwd, stdio: 'inherit' , shell: true})
            let errorMsg = ''
            child.on('error', (error) => {
errorMsg = error.message
            })
            child.on('close', (code) => {
                if (code === 0) {
                    console.log(`[工具调用] execute_command("${command}") - 执行成功`)
                    const cwdInfo = workingDir
            ? `\n\n重要提示：命令在目录 "${workingDir}" 中执行成功。如果需要在这个项目目录中继续执行命令，请使用 workingDir: "${workingDir}" 参数，不要使用 cd 命令。`
            : '';
          resolve(`命令执行成功: ${command}${cwdInfo}`);
                } else {
                    console.error(`[工具调用] execute_command("${command}") - 执行失败，退出码：${code}`)
                    reject(new Error(`命令执行失败: ${command}，退出码：${code}${cwdInfo}`))
                }
            })
        })
    },
    {
        name: 'execute_command',
        description: '执行系统命令，支持指定工作目录，实时显示输出',
        schema: z.object({
            command: z.string().describe('要执行的命令'),
            workingDir: z.string().describe('工作目录').optional()
        })
    }
)

// 4. 列出目录内容工具
const listDirTool = tool(
    async ({dirPaht}) => {
        try {
            const files =  await fs.readdir(dirPath)
            console.log(`[工具调用] list_dir("${dirPath}") - 成功列出 ${files.length} 个文件`)
            return `目录内容：\n${files.join('\n')}`
        } catch (error) {
             console.log(`  [工具调用] list_directory("${directoryPath}") - 错误: ${error.message}`);
      return`列出目录失败: ${error.message}`;
        }
    },
    {
        name: 'list_dir',
        description: '列出指定目录下的所有文件和文件夹',
        schema: z.object({
            dirPath: z.string().describe('目录路径')
        })
    }
)

export {readFileTool, writeFileTool, executeCommandTool, listDirTool}